// src/odfdomchecker/type.ts

export interface CheckerResult {
  hasIssue: boolean
  message: string
  details?: any // 可以用於存儲特定檢查器的額外信息
}

export interface OdfdomCheckResult {
  layoutGrid: CheckerResult
  pageBreak: CheckerResult
  space: CheckerResult
}
