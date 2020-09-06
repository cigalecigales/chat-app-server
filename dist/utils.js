"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = void 0;
/**
 * 日付フォーマット処理
 *
 * @param date 日付
 * @param format フォーマット
 */
exports.formatDate = function (format, date) {
    if (format === void 0) { format = 'yyyy/MM/dd'; }
    if (date === void 0) { date = new Date(); }
    format = format.replace(/yyyy/g, date.getFullYear().toString());
    format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
    format = format.replace(/dd/g, ('0' + date.getDate()).slice(-2));
    format = format.replace(/HH/g, ('0' + date.getHours()).slice(-2));
    format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
    format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
    format = format.replace(/SSS/g, ('00' + date.getMilliseconds()).slice(-3));
    return format;
};
