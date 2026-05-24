/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ContentType {
  PROSE = 'prose',                 // Black ink (المداد الأسود) - القصّة المنثورة
  CONGREGATIONAL = 'congregational', // Green ink (المداد الأخضر) - الشّعر والقرآن والأحاديث الّتي تردّد جماعة
  INDIVIDUAL_SCRIPTURE = 'scripture', // Brown ink (المداد البني) - الآيات والأحاديث الّتي لا تقرأ جماعة
  INDIVIDUAL_POETRY = 'poetry'     // Blue ink (المداد الأزرق) - الشّعر الّذي لا يقرأ جماعة
}

export interface BookTextSegment {
  content: string;
  type: ContentType;
}

export interface BookSection {
  id: string;
  title: string;
  subtitle?: string;
  pageNumber: number;
  segments: BookTextSegment[];
  isQiyamSection?: boolean; // If true, triggers the stand-up interactive celebration
}

export interface AncestorCommentary {
  name: string;
  title?: string;
  description: string;
}

export interface Bookmark {
  sectionId: string;
  pageNumber: number;
  timestamp: string;
}
