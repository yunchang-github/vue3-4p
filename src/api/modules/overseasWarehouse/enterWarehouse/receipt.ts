import { ResPage} from "@/api/interface/index";
import { receipt } from "@/api/interface/overseasWarehouse";
import { PORT3 } from "@/api/config/servicePort";
import http from "@/api";
/**
 * @name 收货单模块
 */
export const getReceiptList = (data: receipt.ReqParams) => {
  return http.request<ResPage<receipt.ResReceiptList>>({
    method: "post",
    url: PORT3 + `/storage/wmsInboundStockReceivingNote/selReceivingNoteInfo`,
    isHideLoading: true,
    types:"json",
    data
  });
};