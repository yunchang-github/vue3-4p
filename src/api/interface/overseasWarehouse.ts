// 菜单模块
export namespace receipt {
  // 请求参数
  export interface ReqParams {
    customerName?: String | undefined,
    inStorageType?: number | undefined,
    arrivalMethod?: number | undefined,
    pageNum:number;
    pageSize:number;
  }
  // 返回参数
  export interface ResReceiptList {
    inStorageNumber:string;
    receivingOperator?: string;
    customerName?: string;
    inStorageTypeStr?:string;
    statusStr?:string;
    reachWay?:string;
    expectDate?:string;
  }
  // export interface RuleForm {
  //   menuId: number,
  //   parentId?: number,
  //   menuName: string,
  // }
}