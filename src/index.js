

/**
 * 
 * @param {url} url  异步加载js
 */
function insertJs (url = '') {
    return new Promise(function (resolve, reject) {
        let script = document.createElement("script");
        script.type = "text/javascript";
        script.src = url;
        document.querySelector('head').appendChild(script);
        script.onload=function(){
            resolve()
        }
        script.onerror=function(){
            reject('js加载失败')
        }
    })
}
//上报使用image
function reportImage (url) {
    (function (url) {
        var image = new Image()
        image.src= url
        image.onload = () => {}
    })(url)
}
function dom2img (doms = []) {
    //压缩图片地址
    if (window.LZString && LZString.compress) {
        for (let dom of doms) {
            html2canvas(dom).then(canvas => {
                let imageurl = canvas.toDataURL("image/png");
                let compressedurl = LZString.compress(imageurl) 
                console.log(compressedurl)
            });
        }
    } else {
        insertJs('//unpkg.com/lz-string@1.4.4/libs/lz-string.js').then(() => {
            for (let dom of doms) {
                html2canvas(dom).then(canvas => {
                    let imageurl = canvas.toDataURL("image/png");
                    let compressedurl = LZString.compress(imageurl)
                    console.log(compressedurl)
                });
            }
        })
    }
}
export class FeMonitor{
    constructor (props = {}) {
        let {
            consolelog = false,
            consoleinfo = false,
            consoleerror = true,
            error = true, //是否上报window error
            errormode = 1, //上报模式 1- window.oerror 2-addEventListener
            captureclick = false, //是否录屏，只录制点击区域
            capturemode = 1, //截屏模式 1-最小区域 2 - 整屏，
            capturereportnum = 1, //截屏上报个数(最多10个)，
            unhandledrejection = true, //捕获浏览器中未处理的Promise错误
            network = true, //ajax fetch异常上报
            performance = true, //性能上报
            browser = true //浏览器信息上报
        } = props
        this.consolelog = consolelog
        this.consoleinfo = consoleinfo
        this.consoleerror = consoleerror
        this.error = error
        this.errormode = errormode
        this.captureclick = captureclick
        this.capturemode = capturemode
        this.capturereportnum = capturereportnum
        this.performance = performance
        this.unhandledrejection = unhandledrejection
        this.network = network
        this.browser = browser
        this.start() 
    }
    start () {
        this.initConsole() //控制台log error info上报
        this.initError() //error事件上报
        this.initCaptureClick() //截屏上报
        this.initUnhandledPromiseRejection() //捕获浏览器中未处理的Promise错误
        this.initNetWork() //ajax、fetch异常上报
        this.initPerference() //性能上报
        this.initBrowserInfo() //浏览器信息上报
    }
    /**
     * 初始化console相关上报
     */
    initConsole () {
        let _ = this
        _.consolelog && _.initConsoleLog()
        _.consoleinfo && _.initConsoleInfo()
        _.consoleerror && _.initConsoleError()
    }
    /**
     * 初始化console.log上报
     */
    initConsoleLog () {
        let consolelogHandler = {
            apply(target, ctx, args) {
                alert('我要进行上报console.log')
                //这里面不宜再写console.log语句，否则进入无限代理死循环
                return Reflect.apply(...arguments);
            }
        }
        console.log = new Proxy(console.log, consolelogHandler)
    }
    /**
     * 初始化console.info上报
     */
    initConsoleInfo () {
        let consoleinfoHandler = {
            apply(target, ctx, args) {
                alert('我要进行上报console.info')
                return Reflect.apply(...arguments);
            }
        }
        console.info = new Proxy(console.info, consoleinfoHandler)
    }
    /**
     * 初始化console.error上报
     */
    initConsoleError () {
        let consoleerrorHandler = {
            apply(target, ctx, args) {
                alert('我要进行上报console.error')
                return Reflect.apply(...arguments);
            }
        }
        console.error = new Proxy(console.error, consoleerrorHandler)
    }
    /**
     * error 事件上报
     */
    initError () {
        let _ = this
        if (!_.error) {
            return
        }
        if (_.errormode === 1) {
            var orignalOnError = window.onerror
            /**
             * @param {String}  errorMessage   错误信息
             * @param {String}  scriptURI      出错的文件
             * @param {Long}    lineNumber     出错代码的行号
             * @param {Long}    columnNumber   出错代码的列号
             * @param {Object}  errorObj       错误的详细信息，Anything
             * 可能会被覆盖
             */
            window.onerror = function (message, source, lineno, colno, error) {
                console.log(message, source, lineno, colno, error)
                orignalOnError && orignalOnError()//如果在我前面还有定义过window.onerror
            }
        } else {
            //不会被覆盖
            window.addEventListener('error', (e) => {
                let {message, filename, lineno, colno, error} = e
                console.log(message, filename, lineno, colno, error)
                _.reportCaptureImage()//上报捕获的图片
            }, true)
        }
        
    }
    /**
     * 录屏上报
     */
    reportCaptureImage () {
        let _ = this
        if (!_.captureclick) {
            return
        }
        //上报录屏个数合法性检查
        _.capturereportnum = _.capturereportnum > 10 ? 10 : _.capturereportnum
        _.capturereportnum = _.capturereportnum <= 0 ? 1 : _.capturereportnum
        const tobeReport = _.capturedDoms.slice(0, _.capturereportnum) || []
        // 从cdn上动态插入
        if (window.html2canvas) {
            if (tobeReport.length && window.html2canvas) {
                dom2img(tobeReport)
            }
        } else {
            insertJs("//unpkg.com/html2canvas@1.0.0-alpha.12/dist/html2canvas.min.js").then(() => {
                if (tobeReport.length && window.html2canvas) {
                    dom2img(tobeReport)
                }
            }).catch((error) => {
                console.log(error)
            }) 
        }  
    }
    /**
     * 点击事件记录，用于错误时，录屏上报
     */
    initCaptureClick () {
        let _ = this
        if (!_.captureclick) {
            return
        }
        _.capturedDoms = []
        window.addEventListener('click', (e) => {
            var pathTemp = Array.from(e.path)
            //html2canvas截取目标只能是document内的dom，所以需要移除window和document
            pathTemp.pop() //移除window
            pathTemp.pop() //移除document
            if (_.capturedDoms.length >= 10) {
                _.capturedDoms.pop();//抛出最后一个
            }
            //录屏模式 1- 最小 2- 全屏
            const path = _.capturemode === 1 ? pathTemp[0] : pathTemp[pathTemp.length - 1]
            _.capturedDoms.unshift(path);//插入最前面
        }, true)//捕获模式
    }
    /**
     * 捕获浏览器中未处理的Promise错误
     */
    initUnhandledPromiseRejection () {
        this.unhandledrejection && window.addEventListener('unhandledrejection', e => {
            console.log(e)
        });
    }
    /**
     * 网络异常上报
     */
    initNetWork () {
        if (!this.network) {
            return
        }
        // 覆写XMLHttpRequest API（这部分直接参考https://segmentfault.com/a/1190000016959011?utm_source=tag-newest）
        if(!window.XMLHttpRequest) return;
        let xmlhttp = window.XMLHttpRequest;
        let _oldSend = xmlhttp.prototype.send;
        let _handleEvent = function (event) {
            if (event && event.currentTarget && event.currentTarget.status !== 200) {
                console.log(event)
            }
        }
        xmlhttp.prototype.send = function () {
            if (this['addEventListener']) {
                this['addEventListener']('error', _handleEvent);
                this['addEventListener']('load', _handleEvent);
                this['addEventListener']('abort', _handleEvent);
                this['addEventListener']('close', _handleEvent);
            } else {
                let _oldStateChange = this['onreadystatechange'];
                this['onreadystatechange'] = function (event) {
                    if (this.readyState === 4) {
                        _handleEvent(event);
                    }
                    _oldStateChange && _oldStateChange.apply(this, arguments);
                };
            }
            return _oldSend.apply(this, arguments);
        }

        // 覆写fetch API
        if (!window.fetch) return;
        let _oldFetch = window.fetch;
        window.fetch = function() {
            return _oldFetch
            .apply(this, arguments)
            .then(function(res){
                if (!res.ok) {
                    // True if status is HTTP 2xx
                    console.log(res)
                }
                return res;
            })
            .catch(function(error){
                console.log(error)
            });
        }
    }
    /**
     * 性能上报
     */
    initPerference () {
        this.performance && window.performance && window.performance.getEntries() && window.performance.getEntries().forEach(function (perf) {
            console.log(JSON.stringify(perf))
        });
    }
    initBrowserInfo () {
        if (!this.browser) {
            return
        }
        if (window.bowser && window.bowser.getParser) {
            const browser = bowser.getParser(window.navigator.userAgent);
            console.log(browser.parse())
        } else {
            insertJs("//unpkg.com/bowser@2.0.0-beta.3/bundled.js").then(() => {
                const browser = bowser.getParser(window.navigator.userAgent);
                console.log(browser.parse())
            }).catch((error) => {
                console.log(error)
            }) 
        }
    }
}
 
