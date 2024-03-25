import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as _ from 'lodash'
import { ReturningStatementNotSupportedError } from 'typeorm';

@Injectable()
export class NguoncService {
  private appUrl: string = ""

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.appUrl = configService.get<string>('app.url')
  }

  async discoverMovie(page = 1, keyword = "") {
    const response = await axios.get(keyword ? `https://phim.nguonc.com/tim-kiem?keyword=${keyword}&page=${page}` : `https://phim.nguonc.com/danh-sach-phim?page=${page}`)
    const $ = cheerio.load(response.data); // load HTML

    const elMovies = $('table[class="min-w-full divide-y divide-gray-200 dark:divide-gray-600"] tbody tr')
    let results = []
    elMovies.each((index, el) => {
      const item = {
        title: $(el).find('h3') ? $(el).find('h3').text().trim() : "",
        genres: $(el).find("td:nth(2)") ? $(el).find("td:nth(2)").text().trim().split('\n').map(el => {
          return {
            name: el.trim()
          }
        }) : [],
        thumb_url: $(el).find("img") ? (this.appUrl + '/proxy/image?url=' + $(el).find("img").attr('data-src')) : "",
        original_title: $(el).find('h4') ? $(el).find('h4').text().trim() : "",
        status: $(el).find("td:nth(1)") ? $(el).find("td:nth(1)").text().trim() : "",
        release_year: $(el).find("td:nth(3)") ? $(el).find("td:nth(3)").text().trim() : "",
        countries: $(el).find("td:nth(4)") ? $(el).find("td:nth(4)").text().trim().split('\n').map(el => {
          return {
            name: el.trim()
          }
        }) : [],
        slug: $(el).find('a') ? $(el).find("a").attr("href").trim().split('/').pop() : ""
      }
      results.push(item)
    })
    return { results }
  }

  async genreMovie() {
    return null
  }

  async detailMovie(slug) {
    const response = await axios.get(`https://phim.nguonc.com/api/film/${slug}`)
    console.log(response.data?.movie);
    if (!response.data?.movie) {
      return null
    }
    return {
      ...response.data?.movie,
      thumb_url: this.appUrl + '/proxy/image?url=' + response.data?.movie.thumb_url
    }
  }
}