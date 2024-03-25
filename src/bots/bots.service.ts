import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as TelegramBot from "node-telegram-bot-api";
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { Member } from './entities/Member';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Message } from './entities/Message';
import { NguoncService } from './nguonc.service';

@Injectable()
export class BotsService implements OnModuleInit {

  private token: string | null = null

  private userName: string | null = null

  private bot: TelegramBot = null

  private appUrl: string = ""

  constructor(
    private readonly configService: ConfigService,
    private readonly serviceMovieService: NguoncService,

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

    this.bot = new TelegramBot(this.token, { polling: true });
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

    const commands = [
      {
        command: 'start',
        description: "Bắt đầu"
      },
      {
        command: 'search',
        description: '🔍 Tìm kiếm'
      }
    ]

    this.bot.addListener('message', async (msg) => {
      if (!msg.text.startsWith('/')) {
        const message = await this.bot.sendMessage(msg.chat.id, `🔍 Bạn có thể xem kết quả của truy vấn "${msg.text}" bằng cách nhấp vào nút "Kết quả tìm kiếm"\n\nNếu nó không hoạt động, hãy đọc hướng dẫn`, {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🔍 Tìm kiếm',
                  switch_inline_query_current_chat: msg.text
                }
              ],
              // [
              //   {
              //     text: '🗂 Thể loại',
              //     switch_inline_query_current_chat: '#categories'
              //   },
              //   {
              //     text: '🈁 Bộ lọc',
              //     callback_data: "create_filter"
              //   },
              // ],
              [
                {
                  text: '🕐 Lịch sử',
                  switch_inline_query_current_chat: '#history'
                },
                {
                  text: '⭐ Yêu thích',
                  switch_inline_query_current_chat: '#favourite'
                }
              ]
            ]
          }
        })
        this.storeMessage(message, true)
      }
    })

    this.bot.setMyCommands(commands, {
      scope: { type: "all_group_chats" },
      language_code: "en"
    })

    this.bot.onText(/\/start/, async (msg) => {
      const messageReps = await this.bot.sendMessage(msg.chat.id, `🍿 Xin chào các bạn yêu thích phim!\n\n🔍 Để tìm kiếm, sử dụng các nút bên dưới hoặc gửi tên phim qua tin nhắn`, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🔍 Bắt đầu tìm kiếm',
                switch_inline_query_current_chat: ''
              }
            ]
          ]
        }
      })
      this.storeMessage(messageReps, true)
    });

    this.bot.on('callback_query', (query) => {
      if (query.data == 'comming_soon') {
        this.bot.answerCallbackQuery(query.id, {
          text: 'Oops! tính năng này đang được phát triển, chúng tôi sẽ thông báo đến bạn khi nó hoàn thành',
          show_alert: true
        })
      }
    })

    this.bot.onText(/\/search/, async (msg) => {
      const message = await this.bot.sendMessage(msg.chat.id, 'Để tìm bộ phim bạn cần, hãy nhấp vào nút "Bắt đầu tìm kiếm" và nhập yêu cầu của bạn hoặc chỉ cần gửi yêu cầu của bạn qua tin nhắn\n\nNếu nó không hoạt động, hãy đọc hướng dẫn', {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🔍 Tìm kiếm',
                switch_inline_query_current_chat: ''
              }
            ],
            // [
            //   {
            //     text: '🗂 Thể loại',
            //     switch_inline_query_current_chat: '#categories'
            //   },
            //   {
            //     text: '🈁 Bộ lọc',
            //     callback_data: "create_filter"
            //   },
            // ],
            [
              {
                text: '🕐 Lịch sử',
                switch_inline_query_current_chat: '#history'
              },
              {
                text: '⭐ Yêu thích',
                switch_inline_query_current_chat: '#favourite'
              }
            ]
          ]
        }
      })
      this.storeMessage(message, true)
    })

    this.bot.on('inline_query', async (query) => {
      const limit = 20
      const offset: number = query.offset ? parseInt(query.offset, 10) : 0
      const page = (offset / limit) + 1

      if (query.query.includes('#')) {
        return
      }

      const { results } = await this.serviceMovieService.discoverMovie(page, query?.query.trim())

      this.bot.answerInlineQuery(query.id, [...results.slice(0, 9)].map(item => {
        return {
          id: item.slug,
          type: 'article',
          title: `${item.title} (${item.original_title})`,
          input_message_content: {
            message_text: `/watch ${item.slug}`
          },
          thumb_url: item.thumb_url,
          thumb_height: 100,
          thumb_width: 100,
          description: `${item.countries.map(el => el.name).join(', ')} | Trạng thái:${item.status} | ${item.release_year} \n${item.genres.map(el => el.name).join(', ')}`,
        }
      }), {
        cache_time: 0,
        next_offset: `${limit * page}`,
      })
    })

    this.bot.onText(/\/watch (.+)/, async (msg, match) => {
      const resp = match[1]; // the captured "whatever"
      const detailMovie = await this.serviceMovieService.detailMovie(resp)
      this.bot.deleteMessage(msg.chat.id, msg.message_id);

      if (!detailMovie) return

      const labelCategory = _.values(detailMovie.category).reduce((result, item) => {
        const label = _.get(item, 'group.name') + ": " + _.get(item, 'list', []).map(el => el.name).join(", ")
        return `${result}\n${label}`
      }, '')
      const caption = `${detailMovie.name} (${detailMovie.original_name})\n\n${detailMovie.description ? detailMovie.description.replace(/<[^>]*>?/gm, '') : '...'}\n\n---------------------\n${labelCategory}\n${detailMovie.language} | ${detailMovie.quality} | ${detailMovie.time}\n\nvia ${this.userName}`
      const serverName = _.get(detailMovie, 'episodes.0.server_name')
      const messageReps = await this.bot.sendPhoto(msg.chat.id, detailMovie.thumb_url, {
        caption,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '↗️ Xem ngay',
                web_app: {
                  url: 'https://revenkroz.github.io/telegram-web-app-bot-example/index.html'
                }
              },
            ],
            [
              {
                text: '🔢 Tập phim',
                callback_data: 'select_episodes'
              },
              {
                text: `🔄 Server (${serverName})`,
                callback_data: 'select_server'
              }
            ],
            [
              {
                text: '🔔 Thông báo',
                callback_data: `select_notification_${detailMovie.id}`
              },
            ],
            [
              {
                text: '⭐ Thêm vào yêu thích',
                switch_inline_query_current_chat: '#favourite'
              }
            ],
            [
              {
                text: '🕐 Lịch sử',
                switch_inline_query_current_chat: '#history'
              },
              {
                text: '🔍 Tìm kiếm',
                switch_inline_query_current_chat: ''
              }
            ]
          ]
        }
      })
      this.storeMessage(messageReps, true)
    });
  }

  async storeMessage(messageReps, isDelete = false) {
    if (isDelete) {
      const messageBefores = await this.messageRepository.find({
        select: ['chatId', 'messageId', 'id'],
        where: {
          deletedAt: IsNull()
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
    this.messageRepository.save(message)
  }
}
