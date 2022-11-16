const request = (options) =>
  new Promise((resolve, reject) => {
    wx.request({
      header: { 'Content-Type': 'application/json' },
      method: 'GET',
      ... options,
      success(res) {
        if (res.data.errorCode === 0) {
          resolve(res.data);
        } else {
          reject(res.data);
        }
      },
      fail(res) {
        reject(res.data);
      },
    });
  });
export default request;