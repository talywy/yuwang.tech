---
layout: post
title: 完美实现Silverlight动态加载
alias: [/2012/11/01/]
tags: silverlight
---

<p><span style="font-family: 微软雅黑; font-size: medium;">这段时间利用项目空隙，研究了一下Silverlight的动态加载技术。动态加载分为两种:</span></p>
<p><span style="font-family: 微软雅黑; font-size: medium;">1、网页局部加载(即一个网页上有多个Silverlight应用)</span></p>
<p><span style="font-family: 微软雅黑; font-size: medium;">2、单个Silverlight应用动态加载(即模块分步加载)。</span></p>
<p><span style="font-family: 微软雅黑; font-size: medium;">这里讨论的是第二种加载方式，对于这种加载模式的处理， 目前网上比较常见的方法也有两种:一种是动态加载xap包，另一种是动态加载dll, 两种方法的实现原理都是一样的（个人比较推荐前一种,因为xap是压缩包可节省带宽，而且如果需要加载多个dll时，后一种方案处理起来较为麻烦）。但是有一些细节处理让人不是很满意，比如</span><a href="http://www.cnblogs.com/wuli00/archive/2009/10/28/1591325.html"><span style="font-weight: normal; font-family: 微软雅黑; font-size: medium;">silverlight动态加载(研究与探讨)</span></a><span style="font-family: 微软雅黑; font-size: medium;"> 这篇文章，虽然实现了动态加载，但是没有很好的解决dll重复引用的问题。本文将在前人研究的基础上，做些总结和改进，提供一个较为完美的解决方案。</span></p>
<p style="padding-bottom: 5px; margin-top: 20px; padding-left: 15px; padding-right: 5px; font-family: 微软雅黑; margin-bottom: 20px; background: #4dc962; color: #ffffff; padding-top: 5px; border: #cdc9f2 2px solid;"><span style="font-size: x-large;"><strong>一、认识XAP包</strong></span></p>
<p><span style="font-family: 微软雅黑; font-size: medium;">使用VS新建一个名为MainApp的Silverlight应用程序，使用默认设置生成一个对应的MainApp.Web工程。完成编译，这时会在对应的Web工程的<strong>ClienBin</strong>目录下生成MainApp.xap文件(实际上是一个zip包)</span></p>
<div style="width: 100%;">
<div id="scid:8747F07C-CDE8-481f-B0DF-C6CFD074BF67:fb71ee04-1b65-40c2-999a-719eb152f60e" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: left; padding: 0px;"><a title="" href="/assets/images/posts/cnblogs_com/talywy/201211/201211011542262155.png" rel="thumbnail"><img src="/assets/images/posts/cnblogs_com/talywy/201211/20121101154226171.png" alt="" width="250" height="211" border="0" /></a></div>
<div id="scid:8747F07C-CDE8-481f-B0DF-C6CFD074BF67:cb9920a3-ffe1-43cc-b9e6-502fe44a077d" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: left; padding: 0px;"><a title="" href="/assets/images/posts/cnblogs_com/talywy/201211/201211011542272613.png" rel="thumbnail"><img src="/assets/images/posts/cnblogs_com/talywy/201211/201211011542277040.png" alt="" width="520" height="162" border="0" /></a></div>
</div>
<p><span style="font-family: 微软雅黑; font-size: medium;">&nbsp;</span></p>
<p><span style="font-family: 微软雅黑; font-size: medium;">&nbsp;</span></p>
<p><span style="font-family: 微软雅黑; font-size: medium;">&nbsp;</span></p>
<p><span style="font-family: 微软雅黑; font-size: medium;">&nbsp;</span></p>
<p><span style="font-family: 微软雅黑; font-size: medium;">&nbsp;</span></p>
<p><span style="font-family: 微软雅黑; font-size: medium;">&nbsp;</span></p>
<p><span style="font-family: 微软雅黑; font-size: medium;">使用工具打开xap:</span></p>
<div style="width: 100%;">
<div id="scid:8747F07C-CDE8-481f-B0DF-C6CFD074BF67:4fd77eb2-eaf5-49fc-affc-3d539c236d78" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: left; padding: 0px;"><a title="" href="/assets/images/posts/cnblogs_com/talywy/201211/201211011542285305.png" rel="thumbnail"><img src="/assets/images/posts/cnblogs_com/talywy/201211/201211011542289383.png" alt="" width="580" height="206" border="0" /></a></div>
</div>
<p><span style="font-family: 微软雅黑; font-size: medium;">&nbsp;</span></p>
<p><span style="font-family: 微软雅黑; font-size: medium;">&nbsp;</span></p>
<p><span style="font-family: 微软雅黑; font-size: medium;">&nbsp;</span></p>
<p><span style="font-family: 微软雅黑; font-size: medium;">&nbsp;</span></p>
<p><span style="font-family: 微软雅黑; font-size: medium;">&nbsp;</span></p>
<p><span style="font-family: 微软雅黑; font-size: medium;">&nbsp;</span></p>
<p><span style="font-family: 微软雅黑; font-size: medium;">可以看到xap包中有一个<strong>AppMainfest.xaml</strong>文件和一个dll文件，我们着重介绍一下<strong>AppMainfest.xaml</strong>文件。使用文本编辑工具打开这个文件:</span></p>
<div class="csharpcode">
<pre class="alt"><span class="kwrd">&lt;</span><span class="html">Deployment</span> <span class="attr">xmlns</span><span class="kwrd">="http://schemas.microsoft.com/client/2007/deployment"</span> </pre>
<pre><span class="attr">xmlns:x</span><span class="kwrd">="http://schemas.microsoft.com/winfx/2006/xaml"</span> </pre>
<pre class="alt"><span class="attr">EntryPointAssembly</span><span class="kwrd">="MainApp"</span> <span class="attr">EntryPointType</span><span class="kwrd">="MainApp.App"</span> <span class="attr">RuntimeVersion</span><span class="kwrd">="5.0.61118.0"</span><span class="kwrd">&gt;</span></pre>
<pre>  <span class="kwrd">&lt;</span><span class="html">Deployment.Parts</span><span class="kwrd">&gt;</span></pre>
<pre class="alt">    <span class="kwrd">&lt;</span><span class="html">AssemblyPart</span> <span class="attr">x:Name</span><span class="kwrd">="MainApp"</span> <span class="attr">Source</span><span class="kwrd">="MainApp.dll"</span> <span class="kwrd">/&gt;</span></pre>
<pre>  <span class="kwrd">&lt;/</span><span class="html">Deployment.Parts</span><span class="kwrd">&gt;</span></pre>
<pre class="alt"><span class="kwrd">&lt;/</span><span class="html">Deployment</span><span class="kwrd">&gt;</span></pre>
</div>
<style><!--
.csharpcode, .csharpcode pre
{
	font-size: small;
	color: black;
	font-family: consolas, "Courier New", courier, monospace;
	background-color: #ffffff;
	/*white-space: pre;*/
}
.csharpcode pre { margin: 0em; }
.csharpcode .rem { color: #008000; }
.csharpcode .kwrd { color: #0000ff; }
.csharpcode .str { color: #006080; }
.csharpcode .op { color: #0000c0; }
.csharpcode .preproc { color: #cc6633; }
.csharpcode .asp { background-color: #ffff00; }
.csharpcode .html { color: #800000; }
.csharpcode .attr { color: #ff0000; }
.csharpcode .alt 
{
	background-color: #f4f4f4;
	width: 100%;
	margin: 0em;
}
.csharpcode .lnum { color: #606060; }
--></style>
<p><span style="font-family: 微软雅黑;"><span style="font-size: medium;"><strong>Deployment</strong>结点中描述了应用程序入口程序集名称，入口类型，运行时版本。<span class="html"><strong>Deployment.Parts</strong>下描述了各个引用的程序集名称及dll所在位置。我们新建一个Model工程，并在MainApp中引用，再次编译，这次生成的XAP包中又多了Model的引用。</span></span></span></p>
<div style="width: 100%;">
<div id="scid:8747F07C-CDE8-481f-B0DF-C6CFD074BF67:ddd7ef85-39ca-4534-83f9-68758e463c8b" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: left; padding: 0px;"><a title="" href="/assets/images/posts/cnblogs_com/talywy/201211/201211011542289906.png" rel="thumbnail"><img src="/assets/images/posts/cnblogs_com/talywy/201211/201211011542296285.png" alt="" width="225" height="300" border="0" /></a></div>
<div id="scid:8747F07C-CDE8-481f-B0DF-C6CFD074BF67:708954cc-ec63-40a0-99f6-9d5d4383941e" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: left; padding: 0px;"><a title="" href="/assets/images/posts/cnblogs_com/talywy/201211/201211011542308138.png" rel="thumbnail"><img src="/assets/images/posts/cnblogs_com/talywy/201211/20121101154230580.png" alt="" width="560" height="196" border="0" /></a></div>
</div>
<p><span style="font-family: 微软雅黑;"><span style="font-size: medium;"><span class="html">&nbsp;</span></span></span></p>
<p><span style="font-family: 微软雅黑;"><span style="font-size: medium;"><span class="html">&nbsp;</span></span></span></p>
<p><span style="font-family: 微软雅黑;"><span style="font-size: medium;"><span class="html">&nbsp;</span></span></span></p>
<p><span style="font-family: 微软雅黑;"><span style="font-size: medium;"><span class="html">&nbsp;</span></span></span></p>
<p><span style="font-family: 微软雅黑;"><span style="font-size: medium;"><span class="html">&nbsp;</span></span></span></p>
<p><span style="font-family: 微软雅黑;"><span style="font-size: medium;"><span class="html">&nbsp;</span></span></span></p>
<p><span style="font-family: 微软雅黑;"><span style="font-size: medium;"><span class="html">&nbsp;</span></span></span></p>
<p><span style="font-family: 微软雅黑;"><span style="font-size: medium;"><span class="html">&nbsp;</span></span></span></p>
<p><span style="font-family: 微软雅黑;"><span style="font-size: medium;"><span class="html">再次打开<strong>AppMainfest.xaml</strong></span> ：</span></span></p>
<div class="csharpcode">
<pre class="alt"><span class="kwrd">&lt;</span><span class="html">Deployment</span> <span class="attr">xmlns</span><span class="kwrd">="http://schemas.microsoft.com/client/2007/deployment"</span> </pre>
<pre><span class="attr">xmlns:x</span><span class="kwrd">="http://schemas.microsoft.com/winfx/2006/xaml"</span> </pre>
<pre class="alt"><span class="attr">EntryPointAssembly</span><span class="kwrd">="MainApp"</span> <span class="attr">EntryPointType</span><span class="kwrd">="MainApp.App"</span> <span class="attr">RuntimeVersion</span><span class="kwrd">="5.0.61118.0"</span><span class="kwrd">&gt;</span></pre>
<pre>  <span class="kwrd">&lt;</span><span class="html">Deployment.Parts</span><span class="kwrd">&gt;</span></pre>
<pre class="alt">    <span class="kwrd">&lt;</span><span class="html">AssemblyPart</span> <span class="attr">x:Name</span><span class="kwrd">="MainApp"</span> <span class="attr">Source</span><span class="kwrd">="MainApp.dll"</span> <span class="kwrd">/&gt;</span></pre>
<pre>    <span class="kwrd">&lt;</span><span class="html">AssemblyPart</span> <span class="attr">x:Name</span><span class="kwrd">="Model"</span> <span class="attr">Source</span><span class="kwrd">="Model.dll"</span> <span class="kwrd">/&gt;</span></pre>
<pre class="alt">  <span class="kwrd">&lt;/</span><span class="html">Deployment.Parts</span><span class="kwrd">&gt;</span></pre>
<pre><span class="kwrd">&lt;/</span><span class="html">Deployment</span><span class="kwrd">&gt;</span></pre>
</div>
<style><!--
.csharpcode, .csharpcode pre
{
	font-size: small;
	color: black;
	font-family: consolas, "Courier New", courier, monospace;
	background-color: #ffffff;
	/*white-space: pre;*/
}
.csharpcode pre { margin: 0em; }
.csharpcode .rem { color: #008000; }
.csharpcode .kwrd { color: #0000ff; }
.csharpcode .str { color: #006080; }
.csharpcode .op { color: #0000c0; }
.csharpcode .preproc { color: #cc6633; }
.csharpcode .asp { background-color: #ffff00; }
.csharpcode .html { color: #800000; }
.csharpcode .attr { color: #ff0000; }
.csharpcode .alt 
{
	background-color: #f4f4f4;
	width: 100%;
	margin: 0em;
}
.csharpcode .lnum { color: #606060; }
--></style>
<p><span style="font-family: 微软雅黑; font-size: medium;">对应的AssemblyPart也对应的增加了，不难想象如果在MainApp中引用了很多dll，那么最终生成的xap包的体积也会变的很大，造成用户访问程序时加载速度很慢。因为即使有些dll在一开始并没有用到，也会在首次加载中一同下载到客户端。对于这种情况，有一种简单的处理方法&mdash;&mdash;<strong> 应用程序库缓存</strong>。</span></p>
<p style="padding-bottom: 5px; margin-top: 20px; padding-left: 15px; padding-right: 5px; font-family: 微软雅黑; margin-bottom: 20px; background: #4dc962; color: #ffffff; padding-top: 5px; border: #cdc9f2 2px solid;"><span style="font-size: x-large;"><strong>二、应用程序库缓存(Application Libary Caching)</strong></span></p>
<p><span style="font-family: 微软雅黑; font-size: medium;">我们在MainApp工程中随便添加几个引用，模拟真实开发环境。重新编译后，新生成的xap包增加了800多KB。</span></p>
<div id="scid:8747F07C-CDE8-481f-B0DF-C6CFD074BF67:e0db4eca-c6a7-4544-97c4-4b100f9b4802" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;"><a title="" href="/assets/images/posts/cnblogs_com/talywy/201211/201211011542325399.png" rel="thumbnail"><img src="/assets/images/posts/cnblogs_com/talywy/201211/201211011542336412.png" alt="" width="580" height="281" border="0" /></a></div>
<p><span style="font-family: 微软雅黑;"><span style="font-size: medium;">此时，打开MainApp工程属性页面，勾选<strong>"Reduce XAP size by using application libary caching"</strong></span></span></p>
<div id="scid:8747F07C-CDE8-481f-B0DF-C6CFD074BF67:102ffe73-47d1-4216-948b-ba492b123064" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;"><a title="" href="/assets/images/posts/cnblogs_com/talywy/201211/201211011542336379.png" rel="thumbnail"><img src="/assets/images/posts/cnblogs_com/talywy/201211/201211011542348822.png" alt="" width="580" height="423" border="0" /></a></div>
<p><span style="font-family: 微软雅黑; font-size: medium;">再次编译，ClientBin目录下生成了几个zip文件，同时这次生成的xap包了体积又降回了原来的9KB</span></p>
<div id="scid:8747F07C-CDE8-481f-B0DF-C6CFD074BF67:e87dfc6a-2e32-4dc1-982c-81834f5d3eec" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;"><a title="" href="/assets/images/posts/cnblogs_com/talywy/201211/201211011542346771.png" rel="thumbnail"><img src="/assets/images/posts/cnblogs_com/talywy/201211/20121101154235575.png" alt="" width="580" height="426" border="0" /></a></div>
<p><span style="font-family: 微软雅黑; font-size: medium;">仔细观察的话，会发现原来xap包中引用的外部dll和新生成的zip文件一一对应。而此时的<span class="html"><strong>AppMainfest.xaml</strong></span> 也发生了变化：</span></p>
<div class="csharpcode">
<pre class="alt"><span class="kwrd">&lt;</span><span class="html">Deployment</span> <span class="attr">xmlns</span><span class="kwrd">="http://schemas.microsoft.com/client/2007/deployment"</span> </pre>
<pre><span class="attr">xmlns:x</span><span class="kwrd">="http://schemas.microsoft.com/winfx/2006/xaml"</span></pre>
<pre class="alt"> <span class="attr">EntryPointAssembly</span><span class="kwrd">="MainApp"</span> <span class="attr">EntryPointType</span><span class="kwrd">="MainApp.App"</span> <span class="attr">RuntimeVersion</span><span class="kwrd">="5.0.61118.0"</span><span class="kwrd">&gt;</span></pre>
<pre>  <span class="kwrd">&lt;</span><span class="html">Deployment.Parts</span><span class="kwrd">&gt;</span></pre>
<pre class="alt">    <span class="kwrd">&lt;</span><span class="html">AssemblyPart</span> <span class="attr">x:Name</span><span class="kwrd">="MainApp"</span> <span class="attr">Source</span><span class="kwrd">="MainApp.dll"</span> <span class="kwrd">/&gt;</span></pre>
<pre>    <span class="kwrd">&lt;</span><span class="html">AssemblyPart</span> <span class="attr">x:Name</span><span class="kwrd">="Model"</span> <span class="attr">Source</span><span class="kwrd">="Model.dll"</span> <span class="kwrd">/&gt;</span></pre>
<pre class="alt">  <span class="kwrd">&lt;/</span><span class="html">Deployment.Parts</span><span class="kwrd">&gt;</span></pre>
<pre>  <span class="kwrd">&lt;</span><span class="html">Deployment.ExternalParts</span><span class="kwrd">&gt;</span></pre>
<pre class="alt">    <span class="kwrd">&lt;</span><span class="html">ExtensionPart</span> <span class="attr">Source</span><span class="kwrd">="System.Windows.Controls.Pivot.zip"</span> <span class="kwrd">/&gt;</span></pre>
<pre>    <span class="kwrd">&lt;</span><span class="html">ExtensionPart</span> <span class="attr">Source</span><span class="kwrd">="System.Windows.Data.zip"</span> <span class="kwrd">/&gt;</span></pre>
<pre class="alt">    <span class="kwrd">&lt;</span><span class="html">ExtensionPart</span> <span class="attr">Source</span><span class="kwrd">="System.Xml.Linq.zip"</span> <span class="kwrd">/&gt;</span></pre>
<pre>    <span class="kwrd">&lt;</span><span class="html">ExtensionPart</span> <span class="attr">Source</span><span class="kwrd">="System.Xml.Serialization.zip"</span> <span class="kwrd">/&gt;</span></pre>
<pre class="alt">    <span class="kwrd">&lt;</span><span class="html">ExtensionPart</span> <span class="attr">Source</span><span class="kwrd">="System.Xml.Utils.zip"</span> <span class="kwrd">/&gt;</span></pre>
<pre>    <span class="kwrd">&lt;</span><span class="html">ExtensionPart</span> <span class="attr">Source</span><span class="kwrd">="System.Xml.XPath.zip"</span> <span class="kwrd">/&gt;</span></pre>
<pre class="alt">    <span class="kwrd">&lt;</span><span class="html">ExtensionPart</span> <span class="attr">Source</span><span class="kwrd">="System.Windows.Controls.zip"</span> <span class="kwrd">/&gt;</span></pre>
<pre>  <span class="kwrd">&lt;/</span><span class="html">Deployment.ExternalParts</span><span class="kwrd">&gt;</span></pre>
<pre class="alt"><span class="kwrd">&lt;/</span><span class="html">Deployment</span><span class="kwrd">&gt;</span></pre>
</div>
<style><!--
.csharpcode, .csharpcode pre
{
	font-size: small;
	color: black;
	font-family: consolas, "Courier New", courier, monospace;
	background-color: #ffffff;
	/*white-space: pre;*/
}
.csharpcode pre { margin: 0em; }
.csharpcode .rem { color: #008000; }
.csharpcode .kwrd { color: #0000ff; }
.csharpcode .str { color: #006080; }
.csharpcode .op { color: #0000c0; }
.csharpcode .preproc { color: #cc6633; }
.csharpcode .asp { background-color: #ffff00; }
.csharpcode .html { color: #800000; }
.csharpcode .attr { color: #ff0000; }
.csharpcode .alt 
{
	background-color: #f4f4f4;
	width: 100%;
	margin: 0em;
}
.csharpcode .lnum { color: #606060; }
--></style>
<p><span style="font-family: 微软雅黑; font-size: medium;">多出了<strong>Deployment.ExternalParts</strong>结点。通过这种方式，用户访问Silverlight应用时，xap下载的速度会得到改善，当程序中用到某一个外部程序集时，则会自动下载对应的Zip包到客户端，并加载其中的程序集。这样只要合理组织程序集之间的引用就可以达到提高加载速度的目的。非常方便简单。</span></p>
<p style="padding-bottom: 5px; margin-top: 20px; padding-left: 15px; padding-right: 5px; font-family: 微软雅黑; margin-bottom: 20px; background: #4dc962; color: #ffffff; padding-top: 5px; border: #cdc9f2 2px solid;"><span style="font-size: x-large;"><strong>三、动态加载XAP</strong></span></p>
<p><span style="font-family: 微软雅黑; font-size: medium;">有了对Xap包结构和<span class="html"><strong>AppMainfest.xaml</strong></span> 结构的初步认识之后，要实现Xap包的动态加载就比较容易了。新建一个Silverlight应用程序EmployeeDataGrid，添加一些逻辑代码和引用。之后再将工程添加到MainApp.Web工程的Silverlight Application中。</span></p>
<div id="scid:8747F07C-CDE8-481f-B0DF-C6CFD074BF67:302ea8c5-c051-404e-98b1-8cc87b876f0c" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;"><a title="" href="/assets/images/posts/cnblogs_com/talywy/201211/201211011542368524.png" rel="thumbnail"><img src="/assets/images/posts/cnblogs_com/talywy/201211/201211011542379854.png" alt="" width="660" height="357" border="0" /></a></div>
<p><span style="font-family: 微软雅黑; font-size: medium;">编译之后在ClinetBin目录下会生成EmployeeDataGrid.xap文件。运行MainApp.Web工程，看到下面的页面。</span></p>
<div style="width: 100%;">
<div id="scid:8747F07C-CDE8-481f-B0DF-C6CFD074BF67:4ce699b8-3651-49bc-b3cd-930806491e46" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: left; padding: 0px;"><a title="" href="/assets/images/posts/cnblogs_com/talywy/201211/201211011542383376.png" rel="thumbnail"><img src="/assets/images/posts/cnblogs_com/talywy/201211/20121101154239703.png" alt="" width="335" height="320" border="0" /></a></div>
<div id="scid:8747F07C-CDE8-481f-B0DF-C6CFD074BF67:fdb8389d-beb9-438c-ac90-7826b18810f7" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;"><a title="" href="/assets/images/posts/cnblogs_com/talywy/201211/201211011542404225.png" rel="thumbnail"><img src="/assets/images/posts/cnblogs_com/talywy/201211/201211011542411127.png" alt="" width="335" height="317" border="0" /></a></div>
</div>
<p><span style="font-family: 微软雅黑; font-size: medium;">首页打开加载MainApp页面，点击页面上的&ldquo;加载员工列表&rdquo;按钮，动态加载EmployeeDataGrid.xap并初始化员工列表，代码如下：</span></p>
<div class="csharpcode">
<pre class="alt"> <span class="rem">/// &lt;summary&gt;</span></pre>
<pre> <span class="rem">/// 加载员工列表按钮点击事件</span></pre>
<pre class="alt"> <span class="rem">/// &lt;/summary&gt;</span></pre>
<pre> <span class="kwrd">private</span> <span class="kwrd">void</span> BtnLoadEmployeeListClick(<span class="kwrd">object</span> sender, RoutedEventArgs e)</pre>
<pre class="alt"> {</pre>
<pre>     LayoutRoot.Children.Remove(BtnLoadEmployeeList);</pre>
<pre class="alt">     LoadXapProgressPanel.Visibility = Visibility.Visible;</pre>
<pre>&nbsp;</pre>
<pre class="alt">     <span class="rem">// 下载xap包</span></pre>
<pre>     var xapClient = <span class="kwrd">new</span> WebClient();</pre>
<pre class="alt">     xapClient.OpenReadCompleted += <span class="kwrd">new</span> OpenReadCompletedEventHandler(ManageXapOpenReadCompleted);</pre>
<pre>     xapClient.DownloadProgressChanged += <span class="kwrd">new</span> DownloadProgressChangedEventHandler(ManageXapDownloadProgressChanged);</pre>
<pre class="alt">     var xapUri = <span class="kwrd">new</span> Uri(HtmlPage.Document.DocumentUri, <span class="str">"ClientBin/EmployeeDataGrid.xap"</span>);</pre>
<pre>     xapClient.OpenReadAsync(xapUri);</pre>
<pre class="alt"> }</pre>
<pre>&nbsp;</pre>
<pre class="alt"> <span class="rem">/// &lt;summary&gt;</span></pre>
<pre> <span class="rem">/// Xap包下载完成</span></pre>
<pre class="alt"> <span class="rem">/// &lt;/summary&gt;</span></pre>
<pre> <span class="rem">/// &lt;param name="sender"&gt;&lt;/param&gt;</span></pre>
<pre class="alt"> <span class="rem">/// &lt;param name="e"&gt;&lt;/param&gt;</span></pre>
<pre> <span class="kwrd">private</span> <span class="kwrd">void</span> ManageXapOpenReadCompleted(<span class="kwrd">object</span> sender, OpenReadCompletedEventArgs e)</pre>
<pre class="alt"> {</pre>
<pre>     <span class="kwrd">if</span> (e.Error == <span class="kwrd">null</span>)</pre>
<pre class="alt">     {</pre>
<pre>         <span class="rem">// 利用反射创建页面</span></pre>
<pre class="alt">         Assembly assembly = XapHelper.LoadAssemblyFromXap(e.Result);</pre>
<pre>         var employeeDataGrid = assembly.CreateInstance(<span class="str">"EmployeeDataGrid.MainPage"</span>) <span class="kwrd">as</span> UserControl;</pre>
<pre class="alt">&nbsp;</pre>
<pre>         <span class="rem">// 将列表页面加载到主页面中</span></pre>
<pre class="alt">         Grid.SetRow(employeeDataGrid, 1);</pre>
<pre>         LayoutRoot.Children.Add(employeeDataGrid);</pre>
<pre class="alt">&nbsp;</pre>
<pre>         LayoutRoot.Children.Remove(LoadXapProgressPanel);</pre>
<pre class="alt">     }</pre>
<pre>     <span class="kwrd">else</span></pre>
<pre class="alt">     {</pre>
<pre>         MessageBox.Show(e.Error.Message);</pre>
<pre class="alt">     }</pre>
<pre> } </pre>
</div>
<style><!--
.csharpcode, .csharpcode pre
{
	font-size: small;
	color: black;
	font-family: consolas, "Courier New", courier, monospace;
	background-color: #ffffff;
	/*white-space: pre;*/
}
.csharpcode pre { margin: 0em; }
.csharpcode .rem { color: #008000; }
.csharpcode .kwrd { color: #0000ff; }
.csharpcode .str { color: #006080; }
.csharpcode .op { color: #0000c0; }
.csharpcode .preproc { color: #cc6633; }
.csharpcode .asp { background-color: #ffff00; }
.csharpcode .html { color: #800000; }
.csharpcode .attr { color: #ff0000; }
.csharpcode .alt 
{
	background-color: #f4f4f4;
	width: 100%;
	margin: 0em;
}
.csharpcode .lnum { color: #606060; }
--></style>
<p><span style="font-family: 微软雅黑; font-size: medium;">加载Xap中程序集的代码:</span></p>
<div class="csharpcode">
<pre class="alt"><span class="rem">/// &lt;summary&gt;</span></pre>
<pre><span class="rem">/// 从XAP包中返回程序集信息</span></pre>
<pre class="alt"><span class="rem">/// &lt;/summary&gt;</span></pre>
<pre><span class="rem">/// &lt;param name="packageStream"&gt;Xap Stream&lt;/param&gt;</span></pre>
<pre class="alt"><span class="rem">/// &lt;returns&gt;入口程序集&lt;/returns&gt;</span></pre>
<pre><span class="kwrd">public</span> <span class="kwrd">static</span> Assembly LoadAssemblyFromXap(Stream packageStream)</pre>
<pre class="alt">{</pre>
<pre>    <span class="rem">// 加载AppManifest.xaml</span></pre>
<pre class="alt">    var streamResourceInfo = <span class="kwrd">new</span> StreamResourceInfo(packageStream, <span class="kwrd">null</span>);</pre>
<pre>    Stream stream = Application.GetResourceStream(streamResourceInfo, <span class="kwrd">new</span> Uri(<span class="str">"AppManifest.xaml"</span>, UriKind.Relative)).Stream;</pre>
<pre class="alt">    XmlReader xmlReader = XmlReader.Create(stream);</pre>
<pre>&nbsp;</pre>
<pre class="alt">    <span class="rem">// 读取程序集信息</span></pre>
<pre>    Assembly entryAssembly = <span class="kwrd">null</span>;</pre>
<pre class="alt">    <span class="kwrd">string</span> entryAssemblyName = <span class="kwrd">string</span>.Empty;</pre>
<pre>    var assemblyPartInfos = <span class="kwrd">new</span> List&lt;AssemblyPartInfo&gt;();</pre>
<pre class="alt">    <span class="kwrd">while</span> (xmlReader.Read())</pre>
<pre>    {</pre>
<pre class="alt">        <span class="kwrd">switch</span> (xmlReader.NodeType)</pre>
<pre>        {</pre>
<pre class="alt">            <span class="kwrd">case</span> XmlNodeType.Element:</pre>
<pre>                <span class="kwrd">if</span> (xmlReader.Name == <span class="str">"Deployment"</span>)</pre>
<pre class="alt">                {</pre>
<pre>                    <span class="rem">// 入口程序集名称</span></pre>
<pre class="alt">                    entryAssemblyName = xmlReader.GetAttribute(<span class="str">"EntryPointAssembly"</span>);</pre>
<pre>                }</pre>
<pre class="alt">                <span class="kwrd">else</span> <span class="kwrd">if</span> (xmlReader.Name == <span class="str">"AssemblyPart"</span>)</pre>
<pre>                {</pre>
<pre class="alt">                    var name = xmlReader.GetAttribute(<span class="str">"x:Name"</span>);</pre>
<pre>                    var source = xmlReader.GetAttribute(<span class="str">"Source"</span>);</pre>
<pre class="alt">&nbsp;</pre>
<pre>                    assemblyPartInfos.Add(<span class="kwrd">new</span> AssemblyPartInfo { Name = name, Source = source });</pre>
<pre class="alt">                }</pre>
<pre>                <span class="kwrd">break</span>;</pre>
<pre class="alt">            <span class="kwrd">default</span>:</pre>
<pre>                <span class="kwrd">break</span>;</pre>
<pre class="alt">        }</pre>
<pre>    }</pre>
<pre class="alt">&nbsp;</pre>
<pre>    var assemblyPart = <span class="kwrd">new</span> AssemblyPart();</pre>
<pre class="alt">    streamResourceInfo = <span class="kwrd">new</span> StreamResourceInfo(packageStream, <span class="str">"application/binary"</span>);</pre>
<pre>    <span class="rem">// 加载程序集</span></pre>
<pre class="alt">    <span class="kwrd">foreach</span> (var assemblyPartInfo <span class="kwrd">in</span> assemblyPartInfos)</pre>
<pre>    {</pre>
<pre class="alt">        var assemblyUri = <span class="kwrd">new</span> Uri(assemblyPartInfo.Source, UriKind.Relative);</pre>
<pre>        StreamResourceInfo streamInfo = Application.GetResourceStream(streamResourceInfo, assemblyUri);</pre>
<pre class="alt">&nbsp;</pre>
<pre>        <span class="rem">// 入口程序集</span></pre>
<pre class="alt">        <span class="kwrd">if</span> (assemblyPartInfo.Name == entryAssemblyName)</pre>
<pre>        {</pre>
<pre class="alt">            entryAssembly = assemblyPart.Load(streamInfo.Stream);</pre>
<pre>        }</pre>
<pre class="alt">        <span class="rem">// 其他程序集</span></pre>
<pre>        <span class="kwrd">else</span></pre>
<pre class="alt">        {</pre>
<pre>            assemblyPart.Load(streamInfo.Stream);</pre>
<pre class="alt">        }</pre>
<pre>    }</pre>
<pre class="alt">&nbsp;</pre>
<pre>    <span class="kwrd">return</span> entryAssembly;</pre>
<pre class="alt">}</pre>
</div>
<style><!--
.csharpcode, .csharpcode pre
{
	font-size: small;
	color: black;
	font-family: consolas, "Courier New", courier, monospace;
	background-color: #ffffff;
	/*white-space: pre;*/
}
.csharpcode pre { margin: 0em; }
.csharpcode .rem { color: #008000; }
.csharpcode .kwrd { color: #0000ff; }
.csharpcode .str { color: #006080; }
.csharpcode .op { color: #0000c0; }
.csharpcode .preproc { color: #cc6633; }
.csharpcode .asp { background-color: #ffff00; }
.csharpcode .html { color: #800000; }
.csharpcode .attr { color: #ff0000; }
.csharpcode .alt 
{
	background-color: #f4f4f4;
	width: 100%;
	margin: 0em;
}
.csharpcode .lnum { color: #606060; }
--></style>
<p><span style="font-family: 微软雅黑; font-size: medium;">至此，已经可以实现Xap的动态加载了。</span></p>
<p style="padding-bottom: 5px; margin-top: 20px; padding-left: 15px; padding-right: 5px; font-family: 微软雅黑; margin-bottom: 20px; background: #4dc962; color: #ffffff; padding-top: 5px; border: #cdc9f2 2px solid;"><span style="font-size: x-large;"><strong>四、一些细节问题</strong></span></p>
<p><strong><span style="font-family: 微软雅黑; font-size: medium;">一、重复引用的程序集</span></strong></p>
<p><span style="font-family: 微软雅黑; font-size: medium;">让我们回过头来看看MainApp.xap和EmployeeDataGrid.xap中的程序集。</span></p>
<div id="scid:8747F07C-CDE8-481f-B0DF-C6CFD074BF67:2f90692f-9c46-4e59-a528-674f592ee7c4" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;"><a title="" href="/assets/images/posts/cnblogs_com/talywy/201211/201211011542416916.png" rel="thumbnail"><img src="/assets/images/posts/cnblogs_com/talywy/201211/201211011542422357.png" alt="" width="580" height="353" border="0" /></a></div>
<p><span style="font-family: 微软雅黑; font-size: medium;">发现，MainApp.xap中已经有的MainApp.dll和Model.dll在EmployeeDataGrid.xap中重复存在了，比较不爽。有人会说只要在发布之前手动删除EmployeeDataGrid.xap中重复的dll就可以了。虽然这样是可行的，但是无疑带来了很多无谓的工作量。其实有一种非常简单的方法可以解决这一问题。只要设置EmployeeDataGrid引用工程中那些重复引用程序集的Copy Local属性为Fasle，再重新编译一下，这次生成xap包时就不会讲这些程序集压缩进去。</span></p>
<div id="scid:8747F07C-CDE8-481f-B0DF-C6CFD074BF67:e1a67032-149d-4129-bb78-93294afd5dce" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;"><a title="" href="/assets/images/posts/cnblogs_com/talywy/201211/201211011542432324.png" rel="thumbnail"><img src="/assets/images/posts/cnblogs_com/talywy/201211/201211011542437831.png" alt="" width="221" height="335" border="0" /></a></div>
<p><strong><span style="color: #444444; font-family: 微软雅黑; font-size: medium;">二、资源问题</span></strong></p>
<p><span style="color: #444444; font-family: 微软雅黑; font-size: medium;">之前看网上的资料，有人提到动态加载xap后一些用到资源的地方会有问题。为此我在Demo中做了测试。在MainApp工程中新建一个UserControl，里面放了一个TextBlock，Text属性绑定到TestControl的Text属性上。并且样式使用静态样式TestStyle（定义在MainApp工程的Resource\Style.xaml中, 在App.xaml中添加）</span></p>
<p><span style="color: #444444; font-family: 微软雅黑; font-size: medium;">TestControl:</span></p>
<div class="csharpcode">
<pre class="alt"><span class="kwrd">&lt;</span><span class="html">UserControl</span> <span class="attr">x:Class</span><span class="kwrd">="MainApp.TestControl"</span></pre>
<pre>    <span class="attr">xmlns</span><span class="kwrd">="http://schemas.microsoft.com/winfx/2006/xaml/presentation"</span></pre>
<pre class="alt">    <span class="attr">xmlns:x</span><span class="kwrd">="http://schemas.microsoft.com/winfx/2006/xaml"</span></pre>
<pre>    <span class="attr">xmlns:d</span><span class="kwrd">="http://schemas.microsoft.com/expression/blend/2008"</span></pre>
<pre class="alt">    <span class="attr">xmlns:mc</span><span class="kwrd">="http://schemas.openxmlformats.org/markup-compatibility/2006"</span> <span class="attr">mc:Ignorable</span><span class="kwrd">="d"</span></pre>
<pre>    <span class="attr">d:DesignHeight</span><span class="kwrd">="300"</span> <span class="attr">d:DesignWidth</span><span class="kwrd">="400"</span><span class="kwrd">&gt;</span></pre>
<pre class="alt">&nbsp;</pre>
<pre>    <span class="kwrd">&lt;</span><span class="html">TextBlock</span> <span class="attr">Text</span><span class="kwrd">="{Binding Path=Text}"</span> <span class="attr">Name</span><span class="kwrd">="TxtTest"</span> <span class="attr">Style</span><span class="kwrd">="{StaticResource TestStyle}"</span> <span class="kwrd">/&gt;</span></pre>
<pre class="alt">    </pre>
<pre><span class="kwrd">&lt;/</span><span class="html">UserControl</span><span class="kwrd">&gt;</span></pre>
</div>
<style><!--
.csharpcode, .csharpcode pre
{
	font-size: small;
	color: black;
	font-family: consolas, "Courier New", courier, monospace;
	background-color: #ffffff;
	/*white-space: pre;*/
}
.csharpcode pre { margin: 0em; }
.csharpcode .rem { color: #008000; }
.csharpcode .kwrd { color: #0000ff; }
.csharpcode .str { color: #006080; }
.csharpcode .op { color: #0000c0; }
.csharpcode .preproc { color: #cc6633; }
.csharpcode .asp { background-color: #ffff00; }
.csharpcode .html { color: #800000; }
.csharpcode .attr { color: #ff0000; }
.csharpcode .alt 
{
	background-color: #f4f4f4;
	width: 100%;
	margin: 0em;
}
.csharpcode .lnum { color: #606060; }
--></style>
<p><span style="font-family: 微软雅黑; font-size: medium;">Style.xaml:</span></p>
<div class="csharpcode">
<pre class="alt"><span class="kwrd">&lt;</span><span class="html">ResourceDictionary</span> <span class="attr">xmlns</span><span class="kwrd">="http://schemas.microsoft.com/winfx/2006/xaml/presentation"</span> </pre>
<pre>    <span class="attr">xmlns:x</span><span class="kwrd">="http://schemas.microsoft.com/winfx/2006/xaml"</span><span class="kwrd">&gt;</span></pre>
<pre class="alt">&nbsp;</pre>
<pre>    <span class="kwrd">&lt;</span><span class="html">Style</span> <span class="attr">x:Key</span><span class="kwrd">="TestStyle"</span> <span class="attr">TargetType</span><span class="kwrd">="TextBlock"</span> <span class="kwrd">&gt;</span></pre>
<pre class="alt">        <span class="kwrd">&lt;</span><span class="html">Setter</span> <span class="attr">Property</span><span class="kwrd">="FontSize"</span> <span class="attr">Value</span><span class="kwrd">="20"</span><span class="kwrd">/&gt;</span></pre>
<pre>        <span class="kwrd">&lt;</span><span class="html">Setter</span> <span class="attr">Property</span><span class="kwrd">="Foreground"</span> <span class="attr">Value</span><span class="kwrd">="Blue"</span> <span class="kwrd">/&gt;</span></pre>
<pre class="alt">    <span class="kwrd">&lt;/</span><span class="html">Style</span><span class="kwrd">&gt;</span></pre>
<pre>    </pre>
<pre class="alt"><span class="kwrd">&lt;/</span><span class="html">ResourceDictionary</span><span class="kwrd">&gt;</span></pre>
</div>
<style><!--
.csharpcode, .csharpcode pre
{
	font-size: small;
	color: black;
	font-family: consolas, "Courier New", courier, monospace;
	background-color: #ffffff;
	/*white-space: pre;*/
}
.csharpcode pre { margin: 0em; }
.csharpcode .rem { color: #008000; }
.csharpcode .kwrd { color: #0000ff; }
.csharpcode .str { color: #006080; }
.csharpcode .op { color: #0000c0; }
.csharpcode .preproc { color: #cc6633; }
.csharpcode .asp { background-color: #ffff00; }
.csharpcode .html { color: #800000; }
.csharpcode .attr { color: #ff0000; }
.csharpcode .alt 
{
	background-color: #f4f4f4;
	width: 100%;
	margin: 0em;
}
.csharpcode .lnum { color: #606060; }
--></style>
<p><span style="font-family: 微软雅黑; font-size: medium;">这样在MainApp工程中用到TestControl没有任何问题。然而当在EmployeeDataGrid中使用TestControl时却出了问题：</span></p>
<div id="scid:8747F07C-CDE8-481f-B0DF-C6CFD074BF67:a06b2757-0205-4630-bb79-299bd9b7132d" class="wlWriterEditableSmartContent" style="margin: 0px; display: inline; float: none; padding: 0px;"><a title="" href="/assets/images/posts/cnblogs_com/talywy/201211/201211011542434766.png" rel="thumbnail"><img src="/assets/images/posts/cnblogs_com/talywy/201211/201211011542436370.png" alt="" width="420" height="296" border="0" /></a></div>
<p><span style="font-family: 微软雅黑; font-size: medium;">因为在EmployeeDataGrid中构造TestControl时，TesrControl内部的TextBlock从当前程序集中找不到名为TestStyle的资源，所以无法完成初始化，就报错了。对于这个错误，有两个解决办法：</span></p>
<p><span style="font-family: 微软雅黑; font-size: medium;">1、修改TestControl的代码，TestBlock对资源的应用放在后台代码中进行：</span></p>
<div class="csharpcode">
<pre class="alt"><span class="kwrd">public</span> TestControl()</pre>
<pre>{</pre>
<pre class="alt">    InitializeComponent();</pre>
<pre>    <span class="kwrd">this</span>.DataContext = <span class="kwrd">this</span>;</pre>
<pre class="alt">&nbsp;</pre>
<pre>    var style = Application.Current.Resources[<span class="str">"TestStyle"</span>] <span class="kwrd">as</span> Style;</pre>
<pre class="alt">    <span class="kwrd">if</span> (style != <span class="kwrd">null</span>)</pre>
<pre>    {</pre>
<pre class="alt">        TxtTest.Style = style;</pre>
<pre>    }</pre>
<pre class="alt">}</pre>
</div>
<style><!--
.csharpcode, .csharpcode pre
{
	font-size: small;
	color: black;
	font-family: consolas, "Courier New", courier, monospace;
	background-color: #ffffff;
	/*white-space: pre;*/
}
.csharpcode pre { margin: 0em; }
.csharpcode .rem { color: #008000; }
.csharpcode .kwrd { color: #0000ff; }
.csharpcode .str { color: #006080; }
.csharpcode .op { color: #0000c0; }
.csharpcode .preproc { color: #cc6633; }
.csharpcode .asp { background-color: #ffff00; }
.csharpcode .html { color: #800000; }
.csharpcode .attr { color: #ff0000; }
.csharpcode .alt 
{
	background-color: #f4f4f4;
	width: 100%;
	margin: 0em;
}
.csharpcode .lnum { color: #606060; }
--></style>
<p><span style="font-family: 微软雅黑; font-size: medium;">2、不修改TestControl的代码，而是在EmployeeDataGrid的App中引用MainApp中的资源。</span></p>
<div class="csharpcode">
<pre class="alt"><span class="kwrd">&lt;</span><span class="html">Application</span> <span class="attr">xmlns</span><span class="kwrd">="http://schemas.microsoft.com/winfx/2006/xaml/presentation"</span></pre>
<pre>             <span class="attr">xmlns:x</span><span class="kwrd">="http://schemas.microsoft.com/winfx/2006/xaml"</span> </pre>
<pre class="alt">             <span class="attr">x:Class</span><span class="kwrd">="EmployeeDataGrid.App"</span><span class="kwrd">&gt;</span></pre>
<pre>    </pre>
<pre class="alt">    <span class="kwrd">&lt;</span><span class="html">Application.Resources</span><span class="kwrd">&gt;</span></pre>
<pre>        <span class="kwrd">&lt;</span><span class="html">ResourceDictionary</span><span class="kwrd">&gt;</span></pre>
<pre class="alt">            <span class="kwrd">&lt;</span><span class="html">ResourceDictionary.MergedDictionaries</span><span class="kwrd">&gt;</span></pre>
<pre>                <span class="kwrd">&lt;</span><span class="html">ResourceDictionary</span> <span class="attr">Source</span><span class="kwrd">="/MainApp;component/Resource/Style.xaml"</span><span class="kwrd">/&gt;</span></pre>
<pre class="alt">            <span class="kwrd">&lt;/</span><span class="html">ResourceDictionary.MergedDictionaries</span><span class="kwrd">&gt;</span></pre>
<pre>        <span class="kwrd">&lt;/</span><span class="html">ResourceDictionary</span><span class="kwrd">&gt;</span></pre>
<pre class="alt">    <span class="kwrd">&lt;/</span><span class="html">Application.Resources</span><span class="kwrd">&gt;</span></pre>
<pre>    </pre>
<pre class="alt"><span class="kwrd">&lt;/</span><span class="html">Application</span><span class="kwrd">&gt;</span></pre>
</div>
<style><!--
.csharpcode, .csharpcode pre
{
	font-size: small;
	color: black;
	font-family: consolas, "Courier New", courier, monospace;
	background-color: #ffffff;
	/*white-space: pre;*/
}
.csharpcode pre { margin: 0em; }
.csharpcode .rem { color: #008000; }
.csharpcode .kwrd { color: #0000ff; }
.csharpcode .str { color: #006080; }
.csharpcode .op { color: #0000c0; }
.csharpcode .preproc { color: #cc6633; }
.csharpcode .asp { background-color: #ffff00; }
.csharpcode .html { color: #800000; }
.csharpcode .attr { color: #ff0000; }
.csharpcode .alt 
{
	background-color: #f4f4f4;
	width: 100%;
	margin: 0em;
}
.csharpcode .lnum { color: #606060; }
--></style>
<p><span style="font-family: 微软雅黑; font-size: medium;">比较两种方法，第二种方法优势明显。第一种方法对于资源的引用都放在后台代码中，增加工作量，而且在设计时也看不到直观效果。所以个人推荐采用第二种方法。</span></p>
<p style="padding-bottom: 5px; margin-top: 20px; padding-left: 15px; padding-right: 5px; font-family: 微软雅黑; margin-bottom: 20px; background: #4dc962; color: #ffffff; padding-top: 5px; border: #cdc9f2 2px solid;"><span style="font-size: x-large;"><strong>五、结尾</strong></span></p>
<p><span style="font-family: 微软雅黑; font-size: medium;">由于xap包自身的压缩特性和<span class="html"><strong>AppMainfest.xaml</strong></span> 对程序集引用的描述全是由IDE自动生成，无需人为干预。所以通过Xap动态加载提高Silverlight应用程序加载速度(结合应用程序库缓存效果更好)实现起来简单方便，在实际项目开发中可加以借鉴。同时对于资源的处理可以根据实际项目考虑放在单独的资源工程中，方便组织管理。如果对本文有任何问题或建议，欢迎给我留言讨论。</span></p>
<p>&nbsp;</p>
<p>参考文章:</p>
<p><a title="http://www.codeproject.com/Articles/192738/What-is-AppManifest-xaml-in-Silverlight" href="http://www.codeproject.com/Articles/192738/What-is-AppManifest-xaml-in-Silverlight">http://www.codeproject.com/Articles/192738/What-is-AppManifest-xaml-in-Silverlight</a></p>
<p><a title="http://www.kunal-chowdhury.com/2011/03/application-library-caching-in.html" href="http://www.kunal-chowdhury.com/2011/03/application-library-caching-in.html">http://www.kunal-chowdhury.com/2011/03/application-library-caching-in.html</a></p>
<p>&nbsp;</p>
<p>附上<a href="/assets/attach/talywy/DynamicLoadDemo.zip">源代码</a><span style="font-family: 微软雅黑; font-size: medium;"> (Silverlight5 + VS2010)</span></p>
<p>&nbsp;</p>
<p><strong>版权说明：</strong><strong>本文章版权归本人及博客园共同所有，未经允许请勿用于任何商业用途。转载请标明原文出处:</strong></p>
<p><strong><a href="http://www.cnblogs.com/talywy/archive/2012/11/01/Silverlight-Dynamic-Load.html">http://www.cnblogs.com/talywy/archive/2012/11/01/Silverlight-Dynamic-Load.html</a> 。</strong></p>