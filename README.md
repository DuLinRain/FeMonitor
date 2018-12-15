# FeMonitor

前端监控初版，包含按需录屏上报、error事件上报，console.log/info/error代理，unhandledrejection上报，接口(ajax, fetch)异常(error,abort,非200等)上报，性能(perfermence)上报

### FeMonotor使用方式

### 1 link到head，然后会暴露一个全局对象FeMonitor，FeMonitor上会挂载FeMonitor类

    <script src="../dist/femonitor.min.js"></script>

    <script>
        new FeMonitor.FeMonitor({
            bossid: 1234, //暂时无效
            consolelog: false, //是否上报console.log
            consoleinfo: false, //是否上报console.info
            consoleerror: true,  //是否上报console.error
            error: true, //是否上报 error 事件
            errormode: 2, //error 事件上报模式 1- window.oerror 2-addEventListener(error)
            captureclick: true, //是否录屏
            capturemode: 1, //录屏模式 1-最小区域(target) 2 - 整屏
            capturereportnum: 1, //录屏上报个数(最多10个) 
            unhandledrejection: true, //上报浏览器中未处理的Promise错误
            performance: true, //性能上报
            network: true //网络异常上报（error,load,abort,close,非200）
        })
    </script>


### 2. import


