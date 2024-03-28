import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as TelegramBot from "node-telegram-bot-api";
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { Member } from './entities/Member';
import * as moment from "moment";
import * as _ from "lodash";
import { Message } from './entities/Message';
import { MoviesService } from 'src/movies/movies.service';
import config from './bots.config'
import {
  renderArticle,
  renderArticleCategory,
  renderButtonBackMovie,
  renderButtonCallbackData,
  renderButtonSearch,
  renderButtonWebapp
} from './bots.helper'

@Injectable()
export class BotsService implements OnModuleInit {

  private token: string | null = null

  private userName: string | null = null

  private bot: TelegramBot = null

  private readonly appUrl: string = ""

  constructor(
    private readonly configService: ConfigService,
    private readonly moviesService: MoviesService,

    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,

    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {
    this.appUrl = configService.get<string>('app.url')
  }

  /**
   * https://medium.com/@calixtemayoraz/step-by-step-guide-to-build-a-telegram-chatbot-with-a-simple-webapp-ui-using-python-44dca453522f
   * https://github.com/revenkroz/telegram-web-app-bot-example/blob/master/index.html
   */
  async onModuleInit() {
    console.log(`[APP_URL] ${this.appUrl}`);

    this.token = this.configService.get<string>('app.telegramToken');
    this.userName = this.configService.get<string>('app.telegramUsername');

    this.bot = new TelegramBot(this.token, {
      polling: true,
    });
    this.bot.addListener('message', async (msg) => {
      if (!msg.from) return
      let member = await this.memberRepository.findOne({
        where: {
          chatId: msg.from.id
        }
      })
      if (!member) {
        member = new Member()
      }

      member.chatId = msg.from.id
      member.firstName = msg.from.first_name
      member.lastName = msg.from.last_name
      member.languageCode = msg.from.language_code
      member.isBot = msg.from.is_bot

      await this.memberRepository.save(member)
    })

    await this.bot.setMyCommands(config.commands, {
      scope: { type: "default" },
    })

    this.bot.onText(/\/start/, async (msg) => {
      const messageReps = await this.bot.sendMessage(msg.chat.id, `🍿 Xin chào các bạn yêu thích phim!\n\n🔍 Để tìm kiếm, sử dụng các nút bên dưới hoặc gửi tên phim qua tin nhắn`, {
        reply_markup: {
          inline_keyboard: [
            [
              renderButtonSearch()
            ],
          ]
        }
      })
      await this.storeMessage(messageReps, true)
    });

    this.bot.onText(/\/search/, async (msg) => {
      const message = await this.bot.sendMessage(msg.chat.id, 'Để tìm bộ phim bạn cần, hãy nhấp vào nút "Bắt đầu tìm kiếm" và nhập yêu cầu của bạn hoặc chỉ cần gửi yêu cầu của bạn qua tin nhắn\n\nNếu nó không hoạt động, hãy đọc hướng dẫn', {
        reply_markup: {
          inline_keyboard: [
            [
              renderButtonSearch('🔍 Tìm kiếm')
            ],
            [
              renderButtonSearch('🗂 Thể loại', '#categories'),
              renderButtonSearch('🈁 Bộ lọc', 'create_filter')
            ],
            [
              renderButtonSearch('🕐 Lịch sử', '#history'),
              renderButtonSearch('⭐ Yêu thích', '#favourite'),
            ]
          ]
        }
      })
      await this.storeMessage(message, true)
    })

    this.bot.on('inline_query', async (query) => {
      const limit = 20
      const offset: number = query.offset ? parseInt(query.offset, 10) : 0
      const page = (offset / limit) + 1

      if (query.query.includes('#')) {
        const categories = await this.moviesService.getCategories()
        if (query.query.startsWith('#categories')) {
          return this.bot.answerInlineQuery(query.id, categories.map(item => {
            return renderArticleCategory(item)
          }), {
            cache_time: 10
          })
        } else {
          const match = query.query.replace('#', '').split(' ')
          console.log(match, match.slice(1).join(' '));
          const cat = _.first(categories.filter(el => el.slug == match[0]))
          console.log(cat);
          const { results } = await this.moviesService.discoverMovie(page, match.slice(1).join(' '), match.slice(1).join(' ') ? cat.id : cat.slug)
          if (results.length == 0) {
            return this.bot.answerInlineQuery(query.id, [
              renderArticle()
            ])
          }

          this.bot.answerInlineQuery(query.id, [...results].map(item => {
            return renderArticle(item)
          }), {
            cache_time: 0,
            next_offset: `${limit * page}`,
          })
        }
      } else {
        const { results } = await this.moviesService.discoverMovie(page, query?.query.trim())
        if (results.length == 0) {
          return this.bot.answerInlineQuery(query.id, [
            renderArticle()
          ])
        }

        this.bot.answerInlineQuery(query.id, [...results].map(item => {
          return renderArticle(item)
        }), {
          cache_time: 0,
          next_offset: `${limit * page}`,
        })
      }
    })

    this.bot.onText(/\/watch (.+)/, async (msg, match) => {
      const resp = match[1]; // the captured "whatever"
      this.bot.deleteMessage(msg.chat.id, msg.message_id);

      const detailMovie = await this.moviesService.detailMovie(resp)
      if (!detailMovie) return

      try {
        const labelCategory = _.values(detailMovie.category).reduce((result, item) => {
          const label = _.get(item, 'group.name') + ": " + _.get(item, 'list', []).map(el => el.name).join(", ")
          return `${result}\n${label}`
        }, '')

        const caption = `${detailMovie.name} (${detailMovie.original_name})\n\n${detailMovie.description ? detailMovie.description.replace(/<[^>]*>?/gm, '').slice(0, 162) + '...' : '...'}\n\n---------------------\n${labelCategory}\n${detailMovie.language} | ${detailMovie.quality} | ${detailMovie.time}\n\nvia ${this.userName}`
        const messageReps = await this.bot.sendPhoto(msg.chat.id, detailMovie.thumb_url, {
          caption,
          reply_markup: await this.detailMovieReplyMarkup(resp, detailMovie)
        })
        this.storeMessage(messageReps, true)
      } catch (error) {
        console.log('ERROR: ' + error.message);
      }
    });

    this.bot.onText(/\/categories(.*)/gm, async (msg, match) => {
      try {
        const keyword = match[1].trim()
        let message = null
        if (keyword) {
          const categories = await this.moviesService.getCategories()
          const cat = _.first(categories.filter(el => el.slug == keyword))
          if (cat) {
            message = await this.bot.sendMessage(msg.chat.id, `🗂 Thể loại: ${cat.title}\n\n🔍 Để tìm kiếm, sử dụng các nút bên dưới hoặc gửi tên phim qua tin nhắn`, {
              reply_markup: {
                inline_keyboard: [
                  [
                    renderButtonSearch('🔍 Bắt đầu tìm kiếm', `#${cat.slug} `)
                  ]
                ]
              }
            })
          }
        } else {
          message = await this.bot.sendMessage(msg.chat.id, '🗂 Thể loại\n\n🍿 Chúc các bạn xem vui vẻ! 🍿', {
            reply_markup: {
              inline_keyboard: [
                [
                  renderButtonSearch('🔍 Bắt đầu tìm kiếm', '#categories')
                ]
              ]
            }
          })
        }
        this.storeMessage(message, true)
      } catch (error) {
        console.log('ERROR: ' + error.message);
      }
    });

    this.bot.on('callback_query', async (query) => {
      if (query.data.startsWith('select_server_')) {
        const resp = query.data.replace('select_server_', '').trim()
        console.log({ resp });
        const message = await this.messageRepository.findOne({
          where: {
            messageId: query.message.message_id,
            chatId: query.message.chat.id
          }
        })
        await this.updateServerSelect(resp, query.message.chat.id, query.message.message_id, message)
      }
    })

    this.bot.on('callback_query', async (query) => {
      if (query.data.startsWith('back_to_')) {
        const resp = query.data.replace('back_to_', '').trim()

        const detailMovie = await this.moviesService.detailMovie(resp)
        if (!detailMovie) return

        this.bot.editMessageReplyMarkup(await this.detailMovieReplyMarkup(resp, detailMovie, query.message.chat.id, query.message.message_id), {
          message_id: query.message.message_id,
          chat_id: query.message.chat.id
        })
      }
    })

    this.bot.on('callback_query', async (query) => {
      if (query.data.startsWith('update_server_name_')) {
        const resp = query.data.replace('update_server_name_', '').trim().split('_')
        const message = await this.messageRepository.findOne({
          where: {
            messageId: query.message.message_id,
            chatId: query.message.chat.id
          }
        })

        message.data = {
          server_name: resp[1]
        }

        const messageUpdate = await this.messageRepository.save(message)
        console.log(messageUpdate);
        await this.updateServerSelect(resp[0], query.message.chat.id, query.message.message_id, messageUpdate)
      }
    })

    this.bot.on('callback_query', async (query) => {
      if (query.data.startsWith('select_episodes_')) {
        const movieId = query.data.replace('select_episodes_', '').trim()
        console.log({ movieId });

        const detailMovie = await this.moviesService.detailMovie(movieId)
        if (!detailMovie) return

        const serverSource = detailMovie.episodes[0].items.map(el => {
          return {
            text: _.lowerCase(el.name) == 'full' ? el.name : `Tập ${el.name}`,
            callback_data: `choose_episodes_${movieId}_${el.slug}`
          }
        });
        let serverSourceChunk = _.chunk(serverSource, 5);
        if (serverSourceChunk.length > 0) {
          console.log(serverSourceChunk.pop().length);

          for (let index = 1; index <= 5 - serverSourceChunk.pop().length; index++) {
            console.log('12');
          }
        }

        await this.bot.editMessageReplyMarkup({
          inline_keyboard: [
            [
              renderButtonBackMovie(movieId)
            ]
          ],
        }, {
          message_id: query.message.message_id,
          chat_id: query.message.chat.id
        })
      }
    })

    this.bot.on('callback_query', (query) => {
      if (query.data == 'comming_soon') {
        this.bot.answerCallbackQuery(query.id, {
          text: 'Oops! tính năng này đang được phát triển, chúng tôi sẽ thông báo đến bạn khi nó hoàn thành',
          show_alert: true
        })
      }
    })

    this.bot.addListener('message', async (msg) => {
      if (!msg.text.startsWith('/')) {
        const message = await this.bot.sendMessage(msg.chat.id, `🔍 Bạn có thể xem kết quả của truy vấn "${msg.text}" bằng cách nhấp vào nút "Kết quả tìm kiếm"\n\nNếu nó không hoạt động, hãy đọc hướng dẫn`, {
          reply_markup: {
            inline_keyboard: [
              [
                renderButtonSearch('🔍 Tìm kiếm', msg.text)
              ],
              [
                renderButtonSearch('🗂 Thể loại', '#categories'),
                renderButtonSearch('🈁 Bộ lọc', 'create_filter')
              ],
              [
                renderButtonSearch('🕐 Lịch sử', '#history'),
                renderButtonSearch('⭐ Yêu thích', '#favourite'),
              ]
            ]
          }
        })
        await this.storeMessage(message, true)
      }
    })
  }

  async updateServerSelect(movieId, chatId, messageId, message = null) {
    const detailMovie = await this.moviesService.detailMovie(movieId)
    if (!detailMovie) return

    let serverName = _.get(detailMovie, 'episodes.0.server_name')
    if (message && message?.data?.server_name) {
      serverName = message?.data?.server_name
    }
    const listServerName = _.values(_.get(detailMovie, 'episodes', {})).map(el => {
      return [
        renderButtonCallbackData(`${serverName == el.server_name ? '✅' : '🔳'} ${el.server_name}`, `update_server_name_${movieId}_${el.server_name}`)
      ]
    })
    console.log(listServerName);
    this.bot.editMessageReplyMarkup({
      inline_keyboard: [
        ...listServerName,
        [
          renderButtonBackMovie(movieId)
        ]
      ],
    }, {
      message_id: messageId,
      chat_id: chatId
    })
  }

  async detailMovieReplyMarkup(slug, detailMovie, chatId = null, messageId = null) {
    let serverName = _.get(detailMovie, 'episodes.0.server_name')
    if (messageId && chatId) {
      const message = await this.messageRepository.findOne({
        where: {
          messageId: messageId,
          chatId: chatId
        }
      })
      if (message && message?.data?.server_name) {
        serverName = message?.data?.server_name
      }
    }

    const serverSource = _.first(_.get(detailMovie, 'episodes', []).filter(el => el.server_name == serverName))
    const embed = _.get(serverSource, 'items.0.embed')
    let linkHls = null
    if (embed) {
      try {
        const embedData = await this.moviesService.getHlsFromEmbed(embed);
        const regexData = /{"file":"(.*?)",/gm.exec(embedData)
        linkHls = regexData[1] ?? null;
      } catch (error) {
        console.log('ERROR: ' + error.message);
      }
    }

    console.log({ linkHls, watchNowUrl: `${this.appUrl}/share/player?url=${linkHls}` });
    return {
      inline_keyboard: [
        linkHls ? [
          renderButtonWebapp('↗️ Xem ngay', `${this.appUrl}/share/player?url=${linkHls}`),
        ] : [],
        [
          renderButtonCallbackData('🔢 Tập phim', `select_episodes_${slug}`),
          renderButtonCallbackData(`🔄 Server (${serverName})`, `select_server_${slug}`)
        ],
        [
          renderButtonCallbackData('⭐ Thêm vào yêu thích', `add_favourite_${slug}`)
        ],
        [
          renderButtonSearch('🕐 Lịch sử', '#history'),
          renderButtonSearch('🔍 Tìm kiếm')
        ]
      ]
    }
  }

  async storeMessage(messageReps, isDelete = false) {
    if (isDelete) {
      const messageBefores = await this.messageRepository.find({
        select: ['chatId', 'messageId', 'id'],
        where: {
          deletedAt: IsNull(),
          chatId: messageReps.chat.id
        }
      })
      console.log(messageBefores.map(el => el.id));

      this.messageRepository.update({
        id: In(messageBefores.map(el => el.id))
      }, {
        deletedAt: moment()
      });

      messageBefores.forEach((item) => {
        try {
          this.bot.deleteMessage(item.chatId, item.messageId)
        } catch (error) {
          console.log(error.message);
        }
      })
    }

    const message = new Message()
    message.chatId = messageReps.chat.id
    message.chat = messageReps.chat
    message.from = messageReps.from
    message.messageId = messageReps.message_id
    message.date = message.date
    message.text = message.text
    message.reply_markup = message.reply_markup
    message.deletedAt = null
    await this.messageRepository.save(message)
  }
}
