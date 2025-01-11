export interface Note {
  reviewId: string;
  bookId: string;
  bookName: string;
  bookAuthor?: string;
  chapterName?: string;
  noteContent: string;
  markText: string;
  noteTime: number;
}
