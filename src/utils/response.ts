import { StatusCode } from '@/enums/statusCode';

export class Body {
  #status: string;
  #message: string;
  #data: unknown;
  #page?: number;
  #pageSize?: number;
  #totalCount?: number;
  #totalPages?: number;

  constructor(
    status: string,
    message: string,
    data?: unknown,
    page?: number,
    pageSize?: number,
    totalCount?: number,
    totalPages?: number,
  ) {
    this.#status = status;
    this.#message = message;
    this.#data = data;
    this.#page = page;
    this.#pageSize = pageSize;
    this.#totalCount = totalCount;
    this.#totalPages = totalPages;
  }

  status(status: StatusCode) {
    this.#status = status;
    return this;
  }

  message(message: string) {
    this.#message = message;
    return this;
  }

  data(data: unknown) {
    this.#data = data;
    return this;
  }

  page(page: number | undefined) {
    this.#page = page;
    return this;
  }

  pageSize(pageSize: number | undefined) {
    this.#pageSize = pageSize;
    return this;
  }

  totalCount(totalCount: number | undefined) {
    this.#totalCount = totalCount;
    return this;
  }

  totalPages(totalPages: number | undefined) {
    this.#totalPages = totalPages;
    return this;
  }

  toJSON() {
    return {
      status: this.#status,
      message: this.#message,
      data: this.#data,
      page: this.#page,
      pageSize: this.#pageSize,
      totalCount: this.#totalCount,
      totalPages: this.#totalPages,
    };
  }

  static success(data: unknown) {
    return new Body(StatusCode.SUCCESS, 'success', data);
  }
}
