export class TrackingLog {
  constructor(logData) {
    this.sequence = logData.sequence;
    this.logStatus = logData.log_status;
    this.city = logData.city;
    this.cityCode = logData.cityCode;
    this.district = logData.district;
    this.districtCode = logData.district_code;
    this.operationEn = logData.operation_en;
    this.operationID = logData.operationID;
    this.operationType = logData.operationType;
    this.delayReason = logData.delayReason;
    this.operation = logData.operation;
    this.locTime = logData.loc_time;
    this.billStatusId = logData.bill_status_id;
  }

  getDateTimeObject() {
    const [datePart, timePart] = this.locTime.split(" ");
    const [day, month, year] = datePart.split("/");
    const [hour, minute] = timePart.split(":");
    return new Date(year, month - 1, day, hour, minute);
  }
}
