---
layout: post
title: 时间同步小工具(Python + Windows Service + NSIS)
alias: [/2013/03/07/]
tags: python, nsis
---

<p>家里有台很多年前买的电脑，CMOS电池残废了，经常遇到开机后系统时间被重置的情况，老妈向我反映用起来很不方便。于是身为一个程序员的我想到写个小工具来帮老妈排忧解难。话不多说，小工具需求如下: <br /><strong>功能需求</strong> -- 电脑开机后自动执行时间同步     <br /><strong>非功能需求</strong> -- 安装执行简单，无需安装额外环境</p>
<h2 class="custom-h2">一、代码实现</h2>
<p>基于以上需求，思路如下：访问网络获取北京时间，然后调用命令行来设置系统时间。程序写成Windows Service，并设置为开机自动运行。正好前段时间在学习Python，所以打算用Python来写这个工具。具体代码如下：</p>
<div class="cnblogs_code" onclick="cnblogs_code_show('b51aa0bc-d4fe-445d-a9d0-a46bdf3f0be1')"><img id="code_img_closed_b51aa0bc-d4fe-445d-a9d0-a46bdf3f0be1" class="code_img_closed" src="http://images.cnblogs.com/OutliningIndicators/ContractedBlock.gif" alt="" /><img id="code_img_opened_b51aa0bc-d4fe-445d-a9d0-a46bdf3f0be1" class="code_img_opened" style="display: none;" onclick="cnblogs_code_hide('b51aa0bc-d4fe-445d-a9d0-a46bdf3f0be1',event)" src="http://images.cnblogs.com/OutliningIndicators/ExpandedBlockStart.gif" alt="" /><span class="cnblogs_code_collapse">获取网络时间</span>
<div id="cnblogs_code_open_b51aa0bc-d4fe-445d-a9d0-a46bdf3f0be1" class="cnblogs_code_hide">
<pre><span style="color: #008080;"> 1</span> <span style="color: #0000ff;">def</span><span style="color: #000000;"> getBeijinTime():
</span><span style="color: #008080;"> 2</span>     <span style="color: #800000;">"""</span>
<span style="color: #008080;"> 3</span> <span style="color: #800000;">　　 获取北京时间
</span><span style="color: #008080;"> 4</span>     <span style="color: #800000;">"""</span>
<span style="color: #008080;"> 5</span>     <span style="color: #0000ff;">try</span><span style="color: #000000;">:
</span><span style="color: #008080;"> 6</span>         conn = httplib.HTTPConnection(<span style="color: #800000;">"</span><span style="color: #800000;">www.beijing-time.org</span><span style="color: #800000;">"</span><span style="color: #000000;">)
</span><span style="color: #008080;"> 7</span>         conn.request(<span style="color: #800000;">"</span><span style="color: #800000;">GET</span><span style="color: #800000;">"</span>, <span style="color: #800000;">"</span><span style="color: #800000;">/time.asp</span><span style="color: #800000;">"</span><span style="color: #000000;">)
</span><span style="color: #008080;"> 8</span>         response =<span style="color: #000000;"> conn.getresponse()
</span><span style="color: #008080;"> 9</span>         <span style="color: #0000ff;">print</span><span style="color: #000000;"> response.status, response.reason
</span><span style="color: #008080;">10</span>         <span style="color: #0000ff;">if</span> response.status == 200<span style="color: #000000;">:
</span><span style="color: #008080;">11</span>             <span style="color: #008000;">#</span><span style="color: #008000;">解析响应的消息</span>
<span style="color: #008080;">12</span>             result =<span style="color: #000000;"> response.read()
</span><span style="color: #008080;">13</span> <span style="color: #000000;">            logging.debug(result)
</span><span style="color: #008080;">14</span>             data = result.split(<span style="color: #800000;">"</span><span style="color: #800000;">\r\n</span><span style="color: #800000;">"</span><span style="color: #000000;">)
</span><span style="color: #008080;">15</span>             year = data[1][len(<span style="color: #800000;">"</span><span style="color: #800000;">nyear</span><span style="color: #800000;">"</span>)+1 : len(data[1])-1<span style="color: #000000;">]
</span><span style="color: #008080;">16</span>             month = data[2][len(<span style="color: #800000;">"</span><span style="color: #800000;">nmonth</span><span style="color: #800000;">"</span>)+1 : len(data[2])-1<span style="color: #000000;">]
</span><span style="color: #008080;">17</span>             day = data[3][len(<span style="color: #800000;">"</span><span style="color: #800000;">nday</span><span style="color: #800000;">"</span>)+1 : len(data[3])-1<span style="color: #000000;">]
</span><span style="color: #008080;">18</span>             <span style="color: #008000;">#</span><span style="color: #008000;">wday = data[4][len("nwday")+1 : len(data[4])-1]</span>
<span style="color: #008080;">19</span>             hrs = data[5][len(<span style="color: #800000;">"</span><span style="color: #800000;">nhrs</span><span style="color: #800000;">"</span>)+1 : len(data[5])-1<span style="color: #000000;">]
</span><span style="color: #008080;">20</span>             minute = data[6][len(<span style="color: #800000;">"</span><span style="color: #800000;">nmin</span><span style="color: #800000;">"</span>)+1 : len(data[6])-1<span style="color: #000000;">]
</span><span style="color: #008080;">21</span>             sec = data[7][len(<span style="color: #800000;">"</span><span style="color: #800000;">nsec</span><span style="color: #800000;">"</span>)+1 : len(data[7])-1<span style="color: #000000;">]
</span><span style="color: #008080;">22</span>             
<span style="color: #008080;">23</span>             beijinTimeStr = <span style="color: #800000;">"</span><span style="color: #800000;">%s/%s/%s %s:%s:%s</span><span style="color: #800000;">"</span> %<span style="color: #000000;"> (year, month, day, hrs, minute, sec)
</span><span style="color: #008080;">24</span>             beijinTime = time.strptime(beijinTimeStr, <span style="color: #800000;">"</span><span style="color: #800000;">%Y/%m/%d %X</span><span style="color: #800000;">"</span><span style="color: #000000;">)
</span><span style="color: #008080;">25</span>             <span style="color: #0000ff;">return</span><span style="color: #000000;"> beijinTime 
</span><span style="color: #008080;">26</span>     <span style="color: #0000ff;">except</span><span style="color: #000000;">:
</span><span style="color: #008080;">27</span>         logging.exception(<span style="color: #800000;">"</span><span style="color: #800000;">getBeijinTime except</span><span style="color: #800000;">"</span><span style="color: #000000;">)
</span><span style="color: #008080;">28</span>         <span style="color: #0000ff;">return</span> None</pre>
</div>
</div>
<div class="cnblogs_code" onclick="cnblogs_code_show('229e0198-e9e3-4628-bac7-ea0e8a73651f')"><img id="code_img_closed_229e0198-e9e3-4628-bac7-ea0e8a73651f" class="code_img_closed" src="http://images.cnblogs.com/OutliningIndicators/ContractedBlock.gif" alt="" /><img id="code_img_opened_229e0198-e9e3-4628-bac7-ea0e8a73651f" class="code_img_opened" style="display: none;" onclick="cnblogs_code_hide('229e0198-e9e3-4628-bac7-ea0e8a73651f',event)" src="http://images.cnblogs.com/OutliningIndicators/ExpandedBlockStart.gif" alt="" /><span class="cnblogs_code_collapse">同步本地系统时间</span>
<div id="cnblogs_code_open_229e0198-e9e3-4628-bac7-ea0e8a73651f" class="cnblogs_code_hide">
<pre><span style="color: #008080;"> 1</span> <span style="color: #0000ff;">def</span><span style="color: #000000;"> syncLocalTime():
</span><span style="color: #008080;"> 2</span>     <span style="color: #800000;">"""</span>
<span style="color: #008080;"> 3</span> <span style="color: #800000;">    同步本地时间
</span><span style="color: #008080;"> 4</span>     <span style="color: #800000;">"""</span>
<span style="color: #008080;"> 5</span>     logging.info(<span style="color: #800000;">"</span><span style="color: #800000;">current local time is: %d-%d-%d %d:%d:%d</span><span style="color: #800000;">"</span> % time.localtime()[:6<span style="color: #000000;">])
</span><span style="color: #008080;"> 6</span>     
<span style="color: #008080;"> 7</span>     beijinTime =<span style="color: #000000;"> getBeijinTime() 
</span><span style="color: #008080;"> 8</span>     <span style="color: #0000ff;">if</span> beijinTime <span style="color: #0000ff;">is</span><span style="color: #000000;"> None:
</span><span style="color: #008080;"> 9</span>         logging.info(<span style="color: #800000;">"</span><span style="color: #800000;">get beijinTime is None, will try again in 30 seconds...</span><span style="color: #800000;">"</span><span style="color: #000000;">)
</span><span style="color: #008080;">10</span>         timer = threading.Timer(30.0<span style="color: #000000;">, syncLocalTime)
</span><span style="color: #008080;">11</span> <span style="color: #000000;">        timer.start();
</span><span style="color: #008080;">12</span>     <span style="color: #0000ff;">else</span><span style="color: #000000;">:
</span><span style="color: #008080;">13</span>         logging.info(<span style="color: #800000;">"</span><span style="color: #800000;">get beijinTime is: %d-%d-%d %d:%d:%d</span><span style="color: #800000;">"</span> % beijinTime[:6<span style="color: #000000;">])
</span><span style="color: #008080;">14</span>             
<span style="color: #008080;">15</span>         tm_year, tm_mon, tm_mday, tm_hour, tm_min, tm_sec = beijinTime[:6<span style="color: #000000;">]
</span><span style="color: #008080;">16</span>         <span style="color: #0000ff;">import</span><span style="color: #000000;"> os
</span><span style="color: #008080;">17</span>         os.system(<span style="color: #800000;">"</span><span style="color: #800000;">date %d-%d-%d</span><span style="color: #800000;">"</span> % (tm_year, tm_mon, tm_mday))     <span style="color: #008000;">#</span><span style="color: #008000;">设置日期</span>
<span style="color: #008080;">18</span>         os.system(<span style="color: #800000;">"</span><span style="color: #800000;">time %d:%d:%d.0</span><span style="color: #800000;">"</span> % (tm_hour, tm_min, tm_sec))    <span style="color: #008000;">#</span><span style="color: #008000;">设置时间</span>
<span style="color: #008080;">19</span>         logging.info(<span style="color: #800000;">"</span><span style="color: #800000;">syncLocalTime complete, current local time: %d-%d-%d %d:%d:%d \n</span><span style="color: #800000;">"</span> % time.localtime()[:6])</pre>
</div>
</div>
<h2 class="custom-h2">二、部署安装</h2>
<p>为了让Python程序能以Windows服务的方式运行，需要用到<a href="http://www.py2exe.org/">py2exe</a>(用来把Python程序编译成exe)和<a href="http://starship.python.net/~skippy/win32/Downloads.html">Python Win32 Extensions</a> 。(py2exe把Python代码编译成Winodws服务时依赖此组件)下载并安装这两个组件。安装完毕后，在Python的安装目录下找到py2exe的Windows Service示例({PythonRoot}\Lib\site-packages\py2exe\samples\advanced\MyService.py)。然后仿照这个示例将上面的代码完善一下。</p>
<div class="cnblogs_code" onclick="cnblogs_code_show('59359157-ab5c-4222-bf64-af8f21bcdd06')"><img id="code_img_closed_59359157-ab5c-4222-bf64-af8f21bcdd06" class="code_img_closed" src="http://images.cnblogs.com/OutliningIndicators/ContractedBlock.gif" alt="" /><img id="code_img_opened_59359157-ab5c-4222-bf64-af8f21bcdd06" class="code_img_opened" style="display: none;" onclick="cnblogs_code_hide('59359157-ab5c-4222-bf64-af8f21bcdd06',event)" src="http://images.cnblogs.com/OutliningIndicators/ExpandedBlockStart.gif" alt="" /><span class="cnblogs_code_collapse">Windows服务示例</span>
<div id="cnblogs_code_open_59359157-ab5c-4222-bf64-af8f21bcdd06" class="cnblogs_code_hide">
<pre><span style="color: #008080;"> 1</span> <span style="color: #0000ff;">import</span><span style="color: #000000;"> win32serviceutil
</span><span style="color: #008080;"> 2</span> <span style="color: #0000ff;">import</span><span style="color: #000000;"> win32service
</span><span style="color: #008080;"> 3</span> <span style="color: #0000ff;">import</span><span style="color: #000000;"> win32event
</span><span style="color: #008080;"> 4</span> <span style="color: #0000ff;">import</span><span style="color: #000000;"> win32evtlogutil
</span><span style="color: #008080;"> 5</span> 
<span style="color: #008080;"> 6</span> <span style="color: #0000ff;">class</span><span style="color: #000000;"> SynctimeService(win32serviceutil.ServiceFramework):
</span><span style="color: #008080;"> 7</span>     _svc_name_ = <span style="color: #800000;">"</span><span style="color: #800000;">Synctime</span><span style="color: #800000;">"</span>
<span style="color: #008080;"> 8</span>     _svc_display_name_ = <span style="color: #800000;">"</span><span style="color: #800000;">Synctime</span><span style="color: #800000;">"</span>
<span style="color: #008080;"> 9</span>     _svc_description_ = <span style="color: #800000;">"</span><span style="color: #800000;">Synchronize local system time with beijin time</span><span style="color: #800000;">"</span>
<span style="color: #008080;">10</span>     _svc_deps_ = [<span style="color: #800000;">"</span><span style="color: #800000;">EventLog</span><span style="color: #800000;">"</span><span style="color: #000000;">]
</span><span style="color: #008080;">11</span>     
<span style="color: #008080;">12</span>     <span style="color: #0000ff;">def</span> <span style="color: #800080;">__init__</span><span style="color: #000000;">(self, args):
</span><span style="color: #008080;">13</span>         win32serviceutil.ServiceFramework.<span style="color: #800080;">__init__</span><span style="color: #000000;">(self, args)
</span><span style="color: #008080;">14</span>         self.hWaitStop =<span style="color: #000000;"> win32event.CreateEvent(None, 0, 0, None)
</span><span style="color: #008080;">15</span> 
<span style="color: #008080;">16</span>     <span style="color: #0000ff;">def</span><span style="color: #000000;"> SvcStop(self):
</span><span style="color: #008080;">17</span> <span style="color: #000000;">        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
</span><span style="color: #008080;">18</span> <span style="color: #000000;">        win32event.SetEvent(self.hWaitStop)
</span><span style="color: #008080;">19</span> 
<span style="color: #008080;">20</span>     <span style="color: #0000ff;">def</span><span style="color: #000000;"> SvcDoRun(self):
</span><span style="color: #008080;">21</span>         <span style="color: #0000ff;">import</span><span style="color: #000000;"> servicemanager
</span><span style="color: #008080;">22</span>           
<span style="color: #008080;">23</span>         <span style="color: #008000;">#</span><span style="color: #008000;"> Write a 'started' event to the event log...</span>
<span style="color: #008080;">24</span> <span style="color: #000000;">        win32evtlogutil.ReportEvent(self._svc_name_,
</span><span style="color: #008080;">25</span> <span style="color: #000000;">                                    servicemanager.PYS_SERVICE_STARTED,
</span><span style="color: #008080;">26</span>                                     0, <span style="color: #008000;">#</span><span style="color: #008000;"> category</span>
<span style="color: #008080;">27</span> <span style="color: #000000;">                                    servicemanager.EVENTLOG_INFORMATION_TYPE,
</span><span style="color: #008080;">28</span>                                     (self._svc_name_, <span style="color: #800000;">''</span><span style="color: #000000;">))
</span><span style="color: #008080;">29</span> 
<span style="color: #008080;">30</span>         <span style="color: #008000;">#</span><span style="color: #008000;"> wait for beeing stopped...</span>
<span style="color: #008080;">31</span> <span style="color: #000000;">        win32event.WaitForSingleObject(self.hWaitStop, win32event.INFINITE)
</span><span style="color: #008080;">32</span> 
<span style="color: #008080;">33</span>         <span style="color: #008000;">#</span><span style="color: #008000;"> and write a 'stopped' event to the event log.</span>
<span style="color: #008080;">34</span> <span style="color: #000000;">        win32evtlogutil.ReportEvent(self._svc_name_,
</span><span style="color: #008080;">35</span> <span style="color: #000000;">                                    servicemanager.PYS_SERVICE_STOPPED,
</span><span style="color: #008080;">36</span>                                     0, <span style="color: #008000;">#</span><span style="color: #008000;"> category</span>
<span style="color: #008080;">37</span> <span style="color: #000000;">                                    servicemanager.EVENTLOG_INFORMATION_TYPE,
</span><span style="color: #008080;">38</span>                                     (self._svc_name_, <span style="color: #800000;">''</span><span style="color: #000000;">))   
</span><span style="color: #008080;">39</span> 
<span style="color: #008080;">40</span> <span style="color: #0000ff;">if</span> <span style="color: #800080;">__name__</span> == <span style="color: #800000;">'</span><span style="color: #800000;">__main__</span><span style="color: #800000;">'</span><span style="color: #000000;">:
</span><span style="color: #008080;">41</span>     <span style="color: #008000;">#</span><span style="color: #008000;"> Note that this code will not be run in the 'frozen' exe-file!!!</span>
<span style="color: #008080;">42</span>     win32serviceutil.HandleCommandLine(SynctimeService)  </pre>
</div>
</div>
<p>之后，再编写一个steup.py文件用来生成安装文件。</p>
<div class="cnblogs_code" onclick="cnblogs_code_show('2775d983-35ca-46ad-8e89-25b729129948')"><img id="code_img_closed_2775d983-35ca-46ad-8e89-25b729129948" class="code_img_closed" src="http://images.cnblogs.com/OutliningIndicators/ContractedBlock.gif" alt="" /><img id="code_img_opened_2775d983-35ca-46ad-8e89-25b729129948" class="code_img_opened" style="display: none;" onclick="cnblogs_code_hide('2775d983-35ca-46ad-8e89-25b729129948',event)" src="http://images.cnblogs.com/OutliningIndicators/ExpandedBlockStart.gif" alt="" /><span class="cnblogs_code_collapse">Setup.py</span>
<div id="cnblogs_code_open_2775d983-35ca-46ad-8e89-25b729129948" class="cnblogs_code_hide">
<pre><span style="color: #008080;"> 1</span> <span style="color: #0000ff;">from</span> distutils.core <span style="color: #0000ff;">import</span><span style="color: #000000;"> setup
</span><span style="color: #008080;"> 2</span> <span style="color: #0000ff;">import</span><span style="color: #000000;"> py2exe
</span><span style="color: #008080;"> 3</span> 
<span style="color: #008080;"> 4</span> <span style="color: #000000;">setup(
</span><span style="color: #008080;"> 5</span>     <span style="color: #008000;">#</span><span style="color: #008000;"> The first three parameters are not required, if at least a</span>
<span style="color: #008080;"> 6</span>     <span style="color: #008000;">#</span><span style="color: #008000;"> 'version' is given, then a versioninfo resource is built from</span>
<span style="color: #008080;"> 7</span>     <span style="color: #008000;">#</span><span style="color: #008000;"> them and added to the executables.</span>
<span style="color: #008080;"> 8</span>     version = <span style="color: #800000;">"</span><span style="color: #800000;">0.0.1</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 9</span>     description = <span style="color: #800000;">"</span><span style="color: #800000;">Synchroniz local system time with beijin time</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">10</span>     name = <span style="color: #800000;">"</span><span style="color: #800000;">sysctime</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">11</span> 
<span style="color: #008080;">12</span>     <span style="color: #008000;">#</span><span style="color: #008000;"> targets to build</span>
<span style="color: #008080;">13</span>     <span style="color: #008000;">#</span><span style="color: #008000;"> console = ["synctime.py"],</span>
<span style="color: #008080;">14</span>     service=[<span style="color: #800000;">"</span><span style="color: #800000;">synctime</span><span style="color: #800000;">"</span><span style="color: #000000;">]
</span><span style="color: #008080;">15</span> )</pre>
</div>
</div>
<p>编译生成windows程序，如下图：</p>
<div id="scid:8747F07C-CDE8-481f-B0DF-C6CFD074BF67:a9cdaa25-1e73-44bc-89e3-39f53293f702" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;"><a title="" href="http://images.cnitblog.com/blog/141415/201303/07205200-3211093ce14b489a88592ae06f835a92.png" rel="thumbnail"><img src="http://images.cnitblog.com/blog/141415/201303/07205204-502ed9929e8d46fa968a9a84779072ae.png" alt="" width="580" height="335" border="0" /></a></div>
<p>然后在控制台中运行：setup.py py2exe ，一切顺利的话会在当前目录下生成build和dist目录。</p>
<div id="scid:8747F07C-CDE8-481f-B0DF-C6CFD074BF67:a3e40408-2fcb-4c6e-b342-76692b93503d" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;"><a title="" href="http://images.cnitblog.com/blog/141415/201303/07205209-212a7f51e0124f18aea30be1ad756f9f.png" rel="thumbnail"><img src="http://images.cnitblog.com/blog/141415/201303/07205217-f709e26a802b44669b7be446d615cd7c.png" alt="" width="580" height="442" border="0" /></a></div>
<p>控制台目录切换到dist目录，找到synctime.exe，在命令行中运行：</p>
<p>synctime.exe &ndash;install (-remove)&nbsp; 安装或移除时间同步服务。</p>
<p>现在可以运行services.msc查看服务运行情况</p>
<div id="scid:8747F07C-CDE8-481f-B0DF-C6CFD074BF67:d9901461-8168-4ae1-abc7-4c0a7590a322" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;"><a title="" href="http://images.cnitblog.com/blog/141415/201303/07205219-731ccb75e70147de926a1c1c229a2797.png" rel="thumbnail"><img src="http://images.cnitblog.com/blog/141415/201303/07205221-f2f301d704c148eaa6d1b76d8d23a853.png" alt="" width="580" height="138" border="0" /></a></div>
<p>可以看到服务并没有启动，而且启动方式为手动。在这里可以右击服务选择属性手动把服务启动起来，并且设置为服务自动启动。</p>
<p>好吧，我承认。这样操作跟上面的需求有点出入了，略显麻烦。为了解决这个问题，自然想到的是用批处理来做。在dist目录下分别建两个批处理文件:</p>
<div class="cnblogs_code" onclick="cnblogs_code_show('2b239dc7-94c9-4437-803a-53a89b72d880')"><img id="code_img_closed_2b239dc7-94c9-4437-803a-53a89b72d880" class="code_img_closed" src="http://images.cnblogs.com/OutliningIndicators/ContractedBlock.gif" alt="" /><img id="code_img_opened_2b239dc7-94c9-4437-803a-53a89b72d880" class="code_img_opened" style="display: none;" onclick="cnblogs_code_hide('2b239dc7-94c9-4437-803a-53a89b72d880',event)" src="http://images.cnblogs.com/OutliningIndicators/ExpandedBlockStart.gif" alt="" /><span class="cnblogs_code_collapse">installservice.bat</span>
<div id="cnblogs_code_open_2b239dc7-94c9-4437-803a-53a89b72d880" class="cnblogs_code_hide">
<pre><span style="color: #008080;"> 1</span> <span style="color: #0000ff;">@echo</span> <span style="color: #0000ff;">off</span>
<span style="color: #008080;"> 2</span> 
<span style="color: #008080;"> 3</span> <span style="color: #008000;">::</span><span style="color: #008000;"> 安装windows服务</span>
<span style="color: #008080;"> 4</span> <span style="color: #0000ff;">echo</span> 正在安装服务，请稍候...
<span style="color: #008080;"> 5</span> synctime.<span style="color: #000000;">exe -install
</span><span style="color: #008080;"> 6</span> 
<span style="color: #008080;"> 7</span> <span style="color: #008000;">::</span><span style="color: #008000;"> 设置服务自动启动</span>
<span style="color: #008080;"> 8</span> <span style="color: #0000ff;">echo</span> 正在启动服务...
<span style="color: #008080;"> 9</span> sc config Synctime <span style="color: #0000ff;">start</span>=<span style="color: #000000;"> AUTO
</span><span style="color: #008080;">10</span> 
<span style="color: #008080;">11</span> <span style="color: #008000;">::</span><span style="color: #008000;"> 启动服务</span>
<span style="color: #008080;">12</span> sc <span style="color: #0000ff;">start</span><span style="color: #000000;"> Synctime
</span><span style="color: #008080;">13</span> 
<span style="color: #008080;">14</span> <span style="color: #0000ff;">echo</span> 服务启动成功, 按任意键继续...
<span style="color: #008080;">15</span> <span style="color: #0000ff;">pause</span></pre>
</div>
</div>
<div class="cnblogs_code" onclick="cnblogs_code_show('99282b9b-5391-44db-ba88-8808a7c6d0bf')"><img id="code_img_closed_99282b9b-5391-44db-ba88-8808a7c6d0bf" class="code_img_closed" src="http://images.cnblogs.com/OutliningIndicators/ContractedBlock.gif" alt="" /><img id="code_img_opened_99282b9b-5391-44db-ba88-8808a7c6d0bf" class="code_img_opened" style="display: none;" onclick="cnblogs_code_hide('99282b9b-5391-44db-ba88-8808a7c6d0bf',event)" src="http://images.cnblogs.com/OutliningIndicators/ExpandedBlockStart.gif" alt="" /><span class="cnblogs_code_collapse">removeserivce.bat</span>
<div id="cnblogs_code_open_99282b9b-5391-44db-ba88-8808a7c6d0bf" class="cnblogs_code_hide">
<pre><span style="color: #008080;"> 1</span> <span style="color: #0000ff;">@echo</span> <span style="color: #0000ff;">off</span>
<span style="color: #008080;"> 2</span> 
<span style="color: #008080;"> 3</span> <span style="color: #008000;">::</span><span style="color: #008000;"> 停止服务</span>
<span style="color: #008080;"> 4</span> <span style="color: #0000ff;">echo</span> 正在停止服务，请稍候...
<span style="color: #008080;"> 5</span> <span style="color: #000000;">sc stop Synctime
</span><span style="color: #008080;"> 6</span> 
<span style="color: #008080;"> 7</span> <span style="color: #0000ff;">echo</span> 正在卸载服务...
<span style="color: #008080;"> 8</span> <span style="color: #008000;">::</span><span style="color: #008000;"> 删除windows服务</span>
<span style="color: #008080;"> 9</span> synctime.<span style="color: #000000;">exe -remove
</span><span style="color: #008080;">10</span> 
<span style="color: #008080;">11</span> <span style="color: #0000ff;">echo</span> 服务卸载完成，请按任意键继续剩余卸载...
<span style="color: #008080;">12</span> <span style="color: #0000ff;">pause</span></pre>
</div>
</div>
<p><br />好了，现在可以把dist打个包发给老妈用了。但是，这样发个一个压缩包，看起来也太不专业了。解决的办法是打一个安装包，把bat脚本打到安装包里，在安装程序时由安装包调用。这里我用的是NISI（使用HM VNISEdit打包向导来生成打包脚本非常方便）。</p>
<h2 class="custom-h2">三、最终安装效果图</h2>
<div id="scid:8747F07C-CDE8-481f-B0DF-C6CFD074BF67:966edc73-4b88-4217-92e4-e2fd8c5746b8" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;"><a title="1" href="http://images.cnitblog.com/blog/141415/201303/07205222-6c7cc32fb88943bbba3da3f1b8838c8d.png" rel="thumbnail"><img src="http://images.cnitblog.com/blog/141415/201303/07205224-0606e0dc52ac49fa9eabc1958dea6685.png" alt="" width="420" height="350" border="0" /></a></div>
<div id="scid:8747F07C-CDE8-481f-B0DF-C6CFD074BF67:276da779-a486-4e55-b2d2-d1b4c2826b14" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;"><a title="2" href="http://images.cnitblog.com/blog/141415/201303/07205225-f8bef7c1346f4478ac6eb3bb520f7010.png" rel="thumbnail"><img src="http://images.cnitblog.com/blog/141415/201303/07205227-0ac57f1683ce471fbd00e73f597223ec.png" alt="" width="420" height="350" border="0" /></a></div>
<div id="scid:8747F07C-CDE8-481f-B0DF-C6CFD074BF67:07c51362-85cd-4b5e-8314-bda978c4cd4c" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;"><a title="3" href="http://images.cnitblog.com/blog/141415/201303/07205231-2cf6c57e8d234bb9a5b60128d75018ab.png" rel="thumbnail"><img src="http://images.cnitblog.com/blog/141415/201303/07205234-d9d354cfd52f4a42807ba415de74c23d.png" alt="" width="420" height="257" border="0" /></a></div>
<div id="scid:8747F07C-CDE8-481f-B0DF-C6CFD074BF67:8bc0314e-19ff-4214-b31b-b2cc1b04b1d2" class="wlWriterEditableSmartContent" style="float: none; margin: 0px; display: inline; padding: 0px;"><a title="4" href="http://images.cnitblog.com/blog/141415/201303/07205235-7bbfc5bd481748948e215d5a0bc263f6.png" rel="thumbnail"><img src="http://images.cnitblog.com/blog/141415/201303/07205236-2f1ead5d83ea43eb9fb29aa4720a527f.png" alt="" width="420" height="350" border="0" /></a></div>
<h2 class="custom-h2">四、结尾</h2>
<p>遗留的问题:</p>
<p>1、从上面的截图可以看到，安装程序在调用批处理时会显示出控制台窗口。这个问题我在网上查找资料，NSIS有相关的插件可以隐藏控制台窗口调用bat文件。</p>
<p>2、我源代码中有写日志文件的操作，但是以Windows服务的方式运行后，日志文件不能写了，不知道有没有好的解决办法。</p>
<p>3、360 ...真是要人命啊....Orz..</p>
<p>&nbsp;</p>
<p>最后附上<a href="/assets/attach/talywy/SyncTime.zip">源代码</a>及时间同步工具<a href="/assets/attach/talywy/SynctimeTool.zip">安装包</a></p>
<p>&nbsp;</p>
<p><strong>版权说明：</strong><strong>本文章版权归本人及博客园共同所有，未经允许请勿用于任何商业用途。转载请标明原文出处:</strong></p>
<p><a href="http://www.cnblogs.com/talywy/archive/2013/03/07/SynctimeTool.html">http://www.cnblogs.com/talywy/archive/2013/03/07/SynctimeTool.html</a></p>