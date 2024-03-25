import { HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { Response } from 'express';
import * as _ from 'lodash'
import { ReadStream } from 'fs';
import axios, { AxiosRequestConfig } from 'axios';

@Injectable()
export class TheMovieDbService {
  private token: string = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwNmIwNmQ5MzY1MDZiY2YwNGUyNTVmZWNlMDNhYzVjOCIsInN1YiI6IjY1ZmQzY2UyMGMxMjU1MDE2NTBiNTY4MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Zuk2ldHEJv75KLIOjgZocfUe_9rTUW9EeNP6u9pySlI'

  constructor(

  ) { }

  async discoverMovie(page = 1, keyword = "") {
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: !!keyword ? `https://api.themoviedb.org/3/search/movie?query=${keyword}&include_adult=false&language=vi&page=${page}` : `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=vi&page=${page}&sort_by=popularity.desc`,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'accept': 'application/json'
      }
    };

    const response = await axios.request(config)
    return {
      results: response.data.results,
      count_item: response.data.results.length
    }
  }

  async genreMovie() {
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: 'https://api.themoviedb.org/3/genre/movie/list?language=vi',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'accept': 'application/json'
      }
    };

    const response = await axios.request(config)
    return response?.data?.genres || {}
  }

  async detailMovie(id) {
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://api.themoviedb.org/3/movie/${id}?language=vi`,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'accept': 'application/json'
      }
    };

    const response = await axios.request(config)
    return response.data
  }
}
