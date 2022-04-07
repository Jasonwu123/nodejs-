const net = require("net")

const ProgressBar = require("progress")

/**
 * 端口扫描函数
 * 
 * @param host {String} 扫描端口的 IP/URL地址
 * @param start {Number} 起始端口
 * @param end {Number} 结束端口
 * @return {Promise} 返回一个Promise对象
*/

function checkPorts(host, start, end) {
    // 返回 Promise
    return new Promise((resolve, reject) => {
        let counts = end - start + 1  // 需要扫描的 IP 数量
        let ports = []  // 保存可连接的 IP

        // 创建进度条
        let bar = new ProgressBar(' scanning [:bar] :percent :etas', {
            complete: '=',
            incomplete: " ",
            width: 50,
            total: counts,
        })

        // 循环扫描所有IP
        for (let i = start; i <= end; ++i) {
            let check = net.connect(
                {
                    host: host,
                    port: i,
                },
                () => {
                    // 连接成功，表示此端口是开放的
                    // 保存此端口
                    ports.push(i)

                    // 检测结束，断开此连接
                    check.destroy()
                })

            check.on("close", () => {
                // check.destroy() 会触发 close 事件
                // 尝试连接端口也会触发 close 事件断开连接
                // 每断开一个连接，说明检测完成了一个端口
                counts--

                // 显示进度条
                bar.tick(1)

                // 此时检测完了所有端口
                if (counts === 0) {
                    if (ports.length) {
                        resolve(ports)
                    } else {
                        reject("no port is open")
                    }
                }
            })

            check.on("error", (err) => {
                // 端口未开发时，连接会失败
                // 此时会触发 error 事件
                // 然后会触发 close 事件
            })

        }
    })
}

/**
 * 导出端口扫描包装函数
 * 
 * @param host {String} 扫描端口的 IP/URL 地址
 * @param start {Number} 起始端口
 * @param end {Number} 结束端口
 * @param callback {function} 回调函数
*/

module.exports = (host, start, end, callback) => {
    // 检测参数
    // 如果只传了三个参数，并且end是一个函数
    // 那么自动作参数调换
    if (typeof end === 'function' && callback === undefined) {
        callback = end
        end = start
    }

    // 调用函数扫描端口
    checkPorts(host, start, end)
        .then((ports) => {
            callback(ports)
        })
        .catch((err) => {
            console.log(err)
        })
}