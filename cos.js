import COS from "cos-js-sdk-v5"; // 通过npm安装的sdk

export default class COSUploadFile {
  static BUCKET = "soul-1255598558";
  static REGION = "ap-beijing";

  constructor(file) {
    // 初始化
    this.file = file;
    this.cos = this.init();
  }

  /**
   * 初始化COS对象，更具临时密钥生成签名
   * @returns {Object} cos 签名对象
   */
  init() {
    return new COS({
      // 腾讯灯塔只对 COS 侧的请求性能进行监控，不会上报业务侧数据。
      EnableTracker: true, // 腾讯灯塔： 为了持续跟踪和优化 SDK 的质量
      // getAuthorization 必选参数
      getAuthorization: function (options, callback) {
        // 初始化时不会调用，只有调用cos方法（比如cos.putObject）时才会进入
        // 异步获取临时密钥
        // 服务端 JS 和 PHP 例子：https://github.com/tencentyun/cos-js-sdk-v5/blob/master/server/
        // 服务端其他语言参考 COS STS SDK ：https://github.com/tencentyun/qcloud-cos-sts-sdk
        // STS 详细文档指引看：https://cloud.tencent.com/document/product/436/14048

        const URL = "http://bgapi.soullightstheworld.com/v1/uploadSts"; // url替换成您自己的后端服务

        const xhr = new XMLHttpRequest();
        xhr.open("GET", URL, true);
        xhr.onload = function (e) {
          try {
            var data = JSON.parse(e.target.responseText).data.sts;
            var credentials = data.credentials;
            // console.log(credentials,'==',data);
          } catch (e) {}
          if (!data || !credentials) {
            return console.error(
              "credentials invalid:\n" + JSON.stringify(data, null, 2)
            );
          }
          callback({
            TmpSecretId: credentials.tmpSecretId,
            TmpSecretKey: credentials.tmpSecretKey,
            SecurityToken: credentials.sessionToken,
            // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
            StartTime: data.startTime, // 时间戳，单位秒，如：1580000000
            ExpiredTime: data.expiredTime, // 时间戳，单位秒，如：1580000000
          });
        };
        xhr.send();
      },
    });
  }

  /**
   * 上传方法
   * @returns {Object} 返回一个Promise对象
   */
  uploadFile() {
    return new Promise((resolve, reject) => {
      this.cos.uploadFile(
        {
          Bucket: COSUploadFile.BUCKET /* 填入您自己的存储桶，必须字段 */,
          Region:
            COSUploadFile.REGION /* 存储桶所在地域，例如ap-beijing，必须字段 */,
          Key: `ph/${this.file.name}` /* 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段 */,
          Body: this
            .file /* 必须，上传文件对象，可以是input[type="file"]标签选择本地文件后得到的file对象 */,
          SliceSize:
            1024 *
            1024 *
            5 /* 触发分块上传的阈值，超过5MB使用分块上传，非必须 */,
        },
        function (err, data) {
          if (err) return reject(err);
          resolve(data);
        }
      );
    });
  }
}
