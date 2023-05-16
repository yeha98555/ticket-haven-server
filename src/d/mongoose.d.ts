/// <reference types="mongoose" />

declare module 'mongoose' {
  interface Document<T = any, TQueryHelpers = any, DocType = any> {
    toJSON<T = Require_id<DocType>>(
      options?: ToObjectOptions & { camelize?: boolean },
    ): FlattenMaps<T>;
  }
}
