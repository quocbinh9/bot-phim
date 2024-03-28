import { randomUUID } from "crypto"
import TelegramBot from "node-telegram-bot-api"

export const renderButtonSearch = (text = '🔍 Bắt đầu tìm kiếm', query = '') => {
  return {
    text,
    switch_inline_query_current_chat: query
  }
}

export const renderButtonBackMovie = (movieId: string) => {
  return {
    text: '🔙 Trở về',
    callback_data: `back_to_${movieId}`
  }
}

export const renderButtonCallbackData = (text, callback_data) => {
  return {
    text,
    callback_data
  }
}

export const renderButtonWebapp = (text, url) => {
  return {
    text: text,
    web_app: {
      url
    }
  }
}

export const renderArticleCategory = (item = null): TelegramBot.InlineQueryResult => {
  if (!item)
    return {
      id: randomUUID(),
      type: 'article',
      title: 'Không tìm thấy kết quả 😓',
      input_message_content: {
        message_text: '/search'
      },
      description: 'Nếu nó không hoạt động, hãy đọc hướng dẫn'
    }

  return {
    id: randomUUID(),
    type: 'article',
    title: item.title,
    input_message_content: {
      message_text: `/categories ${item.slug}`
    },
    description: item.slug
  }
}

export const renderArticle = (item = null): TelegramBot.InlineQueryResult => {
  if (!item)
    return {
      id: randomUUID(),
      type: 'article',
      title: 'Không tìm thấy kết quả 😓',
      input_message_content: {
        message_text: '/search'
      },
      description: 'Nếu nó không hoạt động, hãy đọc hướng dẫn'
    }

  return {
    id: randomUUID(),
    type: 'article',
    title: `${item.title} (${item.original_title})`,
    input_message_content: {
      message_text: `/watch ${item.slug}`
    },
    thumb_url: item.thumb_url,
    thumb_height: 100,
    thumb_width: 100,
    description: `${item.countries.map(el => el.name).join(', ')} | Trạng thái: ${item.status} | ${item.release_year} \n${item.genres.map(el => el.name).join(', ')}`,
  }
}