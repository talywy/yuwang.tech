---
layout: post
title: WPF中实现自定义虚拟容器(实现VirtualizingPanel)
alias: [/2012/09/07/]
tags: WPF
---
<style type="text/css"> pre { background-color: #eee;  color: black; }</style>
<span style="font-family: 微软雅黑; font-size: medium;">在WPF应用程序开发过程中，大数据量的数据展现通常都要考虑性能问题。有下面一种常见的情况:原始数据源数据量很大，但是某一时刻数据容器中的可见元素个数是有限的，剩余大多数元素都处于不可见状态，如果一次性将所有的数据元素都渲染出来则会非常的消耗性能。因而可以考虑只渲染当前可视区域内的元素，当可视区域内的元素需要发生改变时，再渲染即将展现的元素，最后将不再需要展现的元素清除掉，这样可以大大提高性能。在WPF中System.Windows.Controls命名空间下的</span><a href="http://msdn.microsoft.com/zh-cn/library/system.windows.controls.virtualizingstackpanel.aspx" target="_blank"><span style="font-family: 微软雅黑; font-size: medium;">VirtualizingStackPanel</span></a><span style="font-family: 微软雅黑; font-size: medium;">可以实现数据展现的虚拟化功能，ListBox的默认元素展现容器就是它。但有时</span><a href="http://msdn.microsoft.com/zh-cn/library/system.windows.controls.virtualizingstackpanel.aspx" target="_blank"><span style="font-family: 微软雅黑; font-size: medium;">VirtualizingStackPanel</span></a><span style="font-family: 微软雅黑; font-size: medium;">的布局并不能满足我们的实际需要，此时就需要实现自定义布局的虚拟容器了。本文将简单介绍容器自定义布局，然后介绍实现虚拟容器的基本原理，最后给出一个虚拟化分页容器的演示程序。&nbsp;</span>
<p style="text-indent: 30px;"><span style="font-family: 微软雅黑; font-size: medium;">&nbsp;</span></p>
<h2 style="background: #4dc962; border: #cdc9f2 2px solid; padding: 5px;"><span style="font-family: 微软雅黑;"><span style="color: #ffffff;">一、WPF中自定义布局 （已了解容器自定义布局的朋友可略过此节）</span></span></h2>
<p><span style="font-family: 微软雅黑; font-size: medium;">通常实现一个自定义布局的容器，需要继承System.Windows.Controls.Panel, 并重写下面两个方法: </span></p>
<p><a href="http://msdn.microsoft.com/zh-cn/library/system.windows.frameworkelement.measureoverride.aspx" target="_blank"><strong><span style="font-family: 微软雅黑; font-size: medium;">MeasureOverride</span></strong></a><span style="font-family: 微软雅黑; font-size: medium;"> &mdash;&mdash; 用来测量子元素期望的布局尺寸</span></p>
<p><a href="http://msdn.microsoft.com/zh-cn/library/system.windows.frameworkelement.arrangeoverride.aspx" target="_blank"><strong><span style="font-family: 微软雅黑; font-size: medium;">ArrangeOverride</span></strong></a><span style="font-family: 微软雅黑; font-size: medium;"> &mdash;&mdash; 用来安排子元素在容器中的布局。</span></p>
<p>&nbsp;</p>
<p><span style="font-family: 微软雅黑; font-size: medium;">下面用一个简单的SplitPanel来加以说明这两个方法的作用。下面的Window中放置了一个SplitPanel，每点击一次&ldquo;添加&rdquo;按钮，都会向SplitPanel中添加一个填充了随机色的Rectangle， 而SplitPanel中的Rectangle无论有几个，都会在垂直方向上布满容器，水平方向上平均分配宽度。</span></p>
<p><a href="/assets/images/posts/cnblogs_com/talywy/201209/201209072222304717.png"><span style="font-family: 微软雅黑;"><img style="background-image: none; padding-left: 0px; padding-right: 0px; display: inline; padding-top: 0px; border-width: 0px;" title="2012090619124827" src="/assets/images/posts/cnblogs_com/talywy/201209/201209072222348191.png" alt="2012090619124827" width="428" height="322" border="0" /></span></a></p>
<p><span style="font-family: 微软雅黑;">实现代码如下:</span></p>
<div class="cnblogs_code" onclick="cnblogs_code_show('860f43bc-6b22-42d2-b79a-bcc928f66cd3')"><img id="code_img_closed_860f43bc-6b22-42d2-b79a-bcc928f66cd3" class="code_img_closed" src="http://images.cnblogs.com/OutliningIndicators/ContractedBlock.gif" alt="" /><img id="code_img_opened_860f43bc-6b22-42d2-b79a-bcc928f66cd3" class="code_img_opened" style="display: none;" onclick="cnblogs_code_hide('860f43bc-6b22-42d2-b79a-bcc928f66cd3',event)" src="http://images.cnblogs.com/OutliningIndicators/ExpandedBlockStart.gif" alt="" /><span class="cnblogs_code_collapse">SplitPanel </span>
<div id="cnblogs_code_open_860f43bc-6b22-42d2-b79a-bcc928f66cd3" class="cnblogs_code_hide">
<pre><span style="color: #008080;"> 1</span> <span style="color: #808080;">///</span> <span style="color: #808080;">&lt;summary&gt;</span>
<span style="color: #008080;"> 2</span> <span style="color: #808080;">///</span><span style="color: #008000;"> 简单的自定义容器
</span><span style="color: #008080;"> 3</span> <span style="color: #808080;">///</span><span style="color: #008000;"> 子元素在垂直方向布满容器，水平方向平局分配容器宽度
</span><span style="color: #008080;"> 4</span> <span style="color: #808080;">///</span> <span style="color: #808080;">&lt;/summary&gt;</span>
<span style="color: #008080;"> 5</span> <span style="color: #0000ff;">public</span> <span style="color: #0000ff;">class</span><span style="color: #000000;"> SplitPanel : Panel
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 7</span>     <span style="color: #0000ff;">protected</span> <span style="color: #0000ff;">override</span><span style="color: #000000;"> Size MeasureOverride(Size availableSize)
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">    {
</span><span style="color: #008080;"> 9</span>         <span style="color: #0000ff;">foreach</span> (UIElement child <span style="color: #0000ff;">in</span><span style="color: #000000;"> InternalChildren)
</span><span style="color: #008080;">10</span> <span style="color: #000000;">        {
</span><span style="color: #008080;">11</span>             child.Measure(availableSize);   <span style="color: #008000;">//</span><span style="color: #008000;"> 测量子元素期望布局尺寸(child.DesiredSize)</span>
<span style="color: #008080;">12</span> <span style="color: #000000;">        }
</span><span style="color: #008080;">13</span> 
<span style="color: #008080;">14</span>         <span style="color: #0000ff;">return</span> <span style="color: #0000ff;">base</span><span style="color: #000000;">.MeasureOverride(availableSize);
</span><span style="color: #008080;">15</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">16</span> 
<span style="color: #008080;">17</span>     <span style="color: #0000ff;">protected</span> <span style="color: #0000ff;">override</span><span style="color: #000000;"> Size ArrangeOverride(Size finalSize)
</span><span style="color: #008080;">18</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">19</span>         <span style="color: #0000ff;">if</span> (<span style="color: #0000ff;">double</span>.IsInfinity(finalSize.Height) || <span style="color: #0000ff;">double</span><span style="color: #000000;">.IsInfinity(finalSize.Width))
</span><span style="color: #008080;">20</span> <span style="color: #000000;">        {
</span><span style="color: #008080;">21</span>             <span style="color: #0000ff;">throw</span> <span style="color: #0000ff;">new</span> InvalidOperationException(<span style="color: #800000;">"</span><span style="color: #800000;">容器的宽和高必须是确定值</span><span style="color: #800000;">"</span><span style="color: #000000;">);
</span><span style="color: #008080;">22</span> <span style="color: #000000;">        }
</span><span style="color: #008080;">23</span> 
<span style="color: #008080;">24</span>         <span style="color: #0000ff;">if</span> (Children.Count &gt; <span style="color: #800080;">0</span><span style="color: #000000;">)
</span><span style="color: #008080;">25</span> <span style="color: #000000;">        {
</span><span style="color: #008080;">26</span>             <span style="color: #0000ff;">double</span> childAverageWidth = finalSize.Width /<span style="color: #000000;"> Children.Count;
</span><span style="color: #008080;">27</span>             <span style="color: #0000ff;">for</span> (<span style="color: #0000ff;">int</span> childIndex = <span style="color: #800080;">0</span>; childIndex &lt; InternalChildren.Count; childIndex++<span style="color: #000000;">)
</span><span style="color: #008080;">28</span> <span style="color: #000000;">            {
</span><span style="color: #008080;">29</span>                 <span style="color: #008000;">//</span><span style="color: #008000;"> 计算子元素将被安排的布局区域</span>
<span style="color: #008080;">30</span>                 <span style="color: #0000ff;">var</span> rect = <span style="color: #0000ff;">new</span> Rect(childIndex * childAverageWidth, <span style="color: #800080;">0</span><span style="color: #000000;">, childAverageWidth, finalSize.Height);
</span><span style="color: #008080;">31</span> <span style="color: #000000;">                InternalChildren[childIndex].Arrange(rect);
</span><span style="color: #008080;">32</span> <span style="color: #000000;">            }
</span><span style="color: #008080;">33</span> <span style="color: #000000;">        }
</span><span style="color: #008080;">34</span> 
<span style="color: #008080;">35</span>         <span style="color: #0000ff;">return</span> <span style="color: #0000ff;">base</span><span style="color: #000000;">.ArrangeOverride(finalSize);
</span><span style="color: #008080;">36</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">37</span> }</pre>
</div>
</div>
<p><span style="font-size: medium;">SplitPanel的</span><strong style="font-size: medium;"><a href="http://msdn.microsoft.com/zh-cn/library/system.windows.frameworkelement.measureoverride.aspx" target="_blank">MeasureOverride</a>&nbsp;</strong><span style="font-size: medium;">方法参数availableSize是容器可以给出的总布局大小，在方法体中只依次调用了子元素的Measure方法，调用该方法后，子元素的DesiredSize属性就会被赋值, 该属性指明了子元素期望的布局尺寸。（在SplitPanel中并不需要知道子元素的期望布局尺寸，所以可以不必重写</span><strong style="font-size: medium;"><a href="http://msdn.microsoft.com/zh-cn/library/system.windows.frameworkelement.measureoverride.aspx" target="_blank">MeasureOverride</a>&nbsp;</strong><span style="font-size: medium;">方法，但是在一些比较复杂的布局中需要用到子元素的DesiredSize属性时就必须重写）</span></p>
<p><span style="font-family: 微软雅黑; font-size: medium;">SplitPaneld的<strong><a href="http://msdn.microsoft.com/zh-cn/library/system.windows.frameworkelement.arrangeoverride.aspx" target="_blank">ArrangeOverride</a>&nbsp;</strong>方法参数finalSize是容器最终给出的布局大小，26行根据子元素个数先计算出子元素平均宽度，30行再按照子元素索引计算出各自的布局区域信息。然后31行调用子元素的Arrange方法将子元素安排在容器中的合适位置。这样就可以实现期望的布局效果。当UI重绘时(例如子元素个数发生改变、容器布局尺寸发生改变、强制刷新UI等)，会重新执行</span><a href="http://msdn.microsoft.com/zh-cn/library/system.windows.frameworkelement.measureoverride.aspx" target="_blank"><strong><span style="font-family: 微软雅黑; font-size: medium;">MeasureOverride</span></strong></a><span style="font-family: 微软雅黑; font-size: medium;"> 和</span><a href="http://msdn.microsoft.com/zh-cn/library/system.windows.frameworkelement.arrangeoverride.aspx" target="_blank"><strong><span style="font-family: 微软雅黑; font-size: medium;">ArrangeOverride</span></strong></a><span style="font-family: 微软雅黑; font-size: medium;"> 方法。 <br clear="all" /><br /></span></p>
<h2 style="background: #4dc962; border: #cdc9f2 2px solid; padding: 5px;"><span style="font-family: 微软雅黑;"><span style="color: #ffffff;">二、虚拟容器原理</span></span></h2>
<p><span style="font-family: 微软雅黑; font-size: medium;">要想实现一个虚拟容器，并让虚拟容器正常工作，必须满足以下两个条件:</span></p>
<p><strong><span style="font-family: 微软雅黑; font-size: medium;">1、容器继承自System.Windows.Controls.VirtualizingPanel，并实现子元素的实例化、虚拟化及布局处理。</span></strong></p>
<p><strong><span style="font-family: 微软雅黑; font-size: medium;">2、虚拟容器要做为一个System.Windows.Controls.ItemsControl（或继承自ItemsControl的类）实例的ItemsPanel（实际上是定义一个ItemsPanelTemplate） 
      <br clear="all" /></span></strong></p>
<p>&nbsp;</p>
<p><span style="font-family: 微软雅黑; font-size: medium;">下面我们先来了解一下ItemsControl的工作机制：</span></p>
<p style="text-indent: 30px;"><span style="font-family: 微软雅黑; font-size: medium;">当我们为一个ItemsControl指定了ItemsSource属性后，ItemsControl的Items属性就会被初始化,这里面装的就是原始的数据(<em><span style="background-color: #cccccc;">题外话:通过修改Items的Filter可以实现不切换数据源的元素过滤，修改Items的SortDescriptions属性可以实现不切换数据源的元素排序</span></em>)。之后ItemsControl会根据Items来生成<strong>子元素的容器</strong>(ItemsControl生成ContentPresenter, ListBox生成ListBoxItem, ComboBox生成ComboBox等等)，同时将子元素容器的<strong>DataContext设置为与之对应的数据源</strong>，最后每个子元素容器再根据ItemTemplate的定义来渲染子元素实际显示效果。</span></p>
<p style="text-indent: 30px;"><span style="font-family: 微软雅黑; font-size: medium;">对于Panel来说，ItemsControl会一次性生成所有子元素的子元素容器并进行数据初始化，这样就导致在数据量较大时性能会很差。而对于VirtualizingPanel，ItemsControl则不会自动生成子元素容器及子元素的渲染，这一过程需要编程实现。 
    <br clear="all" /></span></p>
<p style="text-indent: 30px;"><span style="font-family: 微软雅黑; font-size: medium;">接下来我们引入另一个重要概念:<a href="http://msdn.microsoft.com/zh-cn/library/system.windows.controls.primitives.generatorposition.aspx" target="_blank"><span style="font-family: 微软雅黑; font-size: medium;"><strong>GeneratorPosition</strong></span></a>,这个结构体用来描述ItemsControl的Items属性中实例化和虚拟化数据项的位置关系，在VirtualizingPanel中可以通过<a href="http://msdn.microsoft.com/en-us/library/system.windows.controls.primitives.iitemcontainergenerator.aspx" target="_blank"><strong>ItemContainerGenerator</strong></a>（注意:在VirtualizingPanel第一次访问这个属性之前要先访问一下InternalChildren属性，否则<a href="http://msdn.microsoft.com/en-us/library/system.windows.controls.primitives.iitemcontainergenerator.aspx" target="_blank"><strong>ItemContainerGenerator</strong></a>会是null，貌似是一个Bug）属性来获取数据项的位置信息，此外通过这个属性还可以进行数据项的实例化和虚拟化。</span></p>
<p><strong style="font-family: 微软雅黑; font-size: medium;">获取数据项GeneratorPosition信息：</strong></p>
<div class="cnblogs_code" onclick="cnblogs_code_show('1017abaa-72fc-4e3d-8571-4d6eb259ca04')"><img id="code_img_opened_1017abaa-72fc-4e3d-8571-4d6eb259ca04" class="code_img_opened" style="display: none;" onclick="cnblogs_code_hide('1017abaa-72fc-4e3d-8571-4d6eb259ca04',event)" src="http://images.cnblogs.com/OutliningIndicators/ExpandedBlockStart.gif" alt="" /><span class="cnblogs_code_collapse">DumpGeneratorContent</span>
<div id="cnblogs_code_open_1017abaa-72fc-4e3d-8571-4d6eb259ca04" class="cnblogs_code_hide">
<pre><span style="color: #008080;"> 1</span> <span style="color: #808080;">///</span> <span style="color: #808080;">&lt;summary&gt;</span>
<span style="color: #008080;"> 2</span> <span style="color: #808080;">///</span><span style="color: #008000;"> 显示数据GeneratorPosition信息
</span><span style="color: #008080;"> 3</span> <span style="color: #808080;">///</span> <span style="color: #808080;">&lt;/summary&gt;</span>
<span style="color: #008080;"> 4</span> <span style="color: #0000ff;">public</span> <span style="color: #0000ff;">void</span><span style="color: #000000;"> DumpGeneratorContent()
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 6</span>     IItemContainerGenerator generator = <span style="color: #0000ff;">this</span><span style="color: #000000;">.ItemContainerGenerator;
</span><span style="color: #008080;"> 7</span>     ItemsControl itemsControl = ItemsControl.GetItemsOwner(<span style="color: #0000ff;">this</span><span style="color: #000000;">);
</span><span style="color: #008080;"> 8</span> 
<span style="color: #008080;"> 9</span>     Console.WriteLine(<span style="color: #800000;">"</span><span style="color: #800000;">Generator positions:</span><span style="color: #800000;">"</span><span style="color: #000000;">);
</span><span style="color: #008080;">10</span>     <span style="color: #0000ff;">for</span> (<span style="color: #0000ff;">int</span> i = <span style="color: #800080;">0</span>; i &lt; itemsControl.Items.Count; i++<span style="color: #000000;">)
</span><span style="color: #008080;">11</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">12</span>         GeneratorPosition position =<span style="color: #000000;"> generator.GeneratorPositionFromIndex(i);
</span><span style="color: #008080;">13</span>         Console.WriteLine(<span style="color: #800000;">"</span><span style="color: #800000;">Item index=</span><span style="color: #800000;">"</span> + i + <span style="color: #800000;">"</span><span style="color: #800000;">, Generator position: index=</span><span style="color: #800000;">"</span> + position.Index + <span style="color: #800000;">"</span><span style="color: #800000;">, offset=</span><span style="color: #800000;">"</span> +<span style="color: #000000;"> position.Offset);
</span><span style="color: #008080;">14</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">15</span> <span style="color: #000000;">    Console.WriteLine();
</span><span style="color: #008080;">16</span> }</pre>
</div>
</div>
<p><span style="font-family: 微软雅黑; font-size: medium;">第7行通过ItemsControl的静态方法GetItemsOwner可以找到容器所在的ItemsControl，这样就可以访问到数据项集合，第12行代码调用generator 的GeneratorPositionFromIndex方法，通过数据项的索引得到数据项的GeneratorPosition 信息。</span></p>
<div class="csharpcode">
<div class="csharpcode">
<span style="font-family: 微软雅黑; font-size: medium;"><span style="font-family: 微软雅黑; font-size: medium;"><strong>数据项实例化：</strong></span></span>
<div class="cnblogs_code" onclick="cnblogs_code_show('aff6063c-28f1-45ae-88fe-f72dffd8b0ae')"><img id="code_img_closed_aff6063c-28f1-45ae-88fe-f72dffd8b0ae" class="code_img_closed" src="http://images.cnblogs.com/OutliningIndicators/ContractedBlock.gif" alt="" /><img id="code_img_opened_aff6063c-28f1-45ae-88fe-f72dffd8b0ae" class="code_img_opened" style="display: none;" onclick="cnblogs_code_hide('aff6063c-28f1-45ae-88fe-f72dffd8b0ae',event)" src="http://images.cnblogs.com/OutliningIndicators/ExpandedBlockStart.gif" alt="" /><span class="cnblogs_code_collapse">RealizeChild</span>
<div id="cnblogs_code_open_aff6063c-28f1-45ae-88fe-f72dffd8b0ae" class="cnblogs_code_hide">
<pre><span style="color: #008080;"> 1</span> <span style="color: #808080;">///</span> <span style="color: #808080;">&lt;summary&gt;</span>
<span style="color: #008080;"> 2</span> <span style="color: #808080;">///</span><span style="color: #008000;"> 实例化子元素
</span><span style="color: #008080;"> 3</span> <span style="color: #808080;">///</span> <span style="color: #808080;">&lt;/summary&gt;</span>
<span style="color: #008080;"> 4</span> <span style="color: #808080;">///</span> <span style="color: #808080;">&lt;param name="itemIndex"&gt;</span><span style="color: #008000;">数据条目索引</span><span style="color: #808080;">&lt;/param&gt;</span>
<span style="color: #008080;"> 5</span> <span style="color: #0000ff;">public</span> <span style="color: #0000ff;">void</span> RealizeChild(<span style="color: #0000ff;">int</span><span style="color: #000000;"> itemIndex)
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 7</span>     IItemContainerGenerator generator = <span style="color: #0000ff;">this</span><span style="color: #000000;">.ItemContainerGenerator;
</span><span style="color: #008080;"> 8</span>     GeneratorPosition position =<span style="color: #000000;"> generator.GeneratorPositionFromIndex(itemIndex);
</span><span style="color: #008080;"> 9</span> 
<span style="color: #008080;">10</span>     <span style="color: #0000ff;">using</span> (generator.StartAt(position, GeneratorDirection.Forward, allowStartAtRealizedItem: <span style="color: #0000ff;">true</span><span style="color: #000000;">))
</span><span style="color: #008080;">11</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">12</span>         <span style="color: #0000ff;">bool</span><span style="color: #000000;"> isNewlyRealized;
</span><span style="color: #008080;">13</span>         <span style="color: #0000ff;">var</span> child = (UIElement)generator.GenerateNext(<span style="color: #0000ff;">out</span> isNewlyRealized); <span style="color: #008000;">//</span><span style="color: #008000;"> 实例化(构造出空的子元素UI容器)</span>
<span style="color: #008080;">14</span> 
<span style="color: #008080;">15</span>         <span style="color: #0000ff;">if</span><span style="color: #000000;"> (isNewlyRealized)
</span><span style="color: #008080;">16</span> <span style="color: #000000;">        {
</span><span style="color: #008080;">17</span>             generator.PrepareItemContainer(child); <span style="color: #008000;">//</span><span style="color: #008000;"> 填充UI容器数据</span>
<span style="color: #008080;">18</span> <span style="color: #000000;">        }
</span><span style="color: #008080;">19</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">20</span> }</pre>
</div>
</div>
<p><span style="font-family: 微软雅黑; font-size: medium;">第10行调用generator 的StartAt方法确定准备实例化元素的数据项位置，第13行调用generator的GenerateNext方法进行数据项的实例化，输出参数isNewlyRealized为ture则表明该元素是从虚拟化状态实例化出来的，false则表明该元素已被实例化。注意，该方法只是构造出了子元素的UI容器，只有调用了17行的PrepareItemContainer方法，UI容器的实际内容才会根据ItemsControl的ItemTemplate定义进行渲染。</span></p>
</div>
<div class="csharpcode">
<div class="csharpcode">
<span style="font-family: 微软雅黑; font-size: medium;"><span style="font-family: 微软雅黑; font-size: medium;"><strong>数据项虚拟化：</strong></span></span>
<div class="cnblogs_code" onclick="cnblogs_code_show('9276a821-4675-47bd-a94f-ca5ad0e1d540')"><img id="code_img_closed_9276a821-4675-47bd-a94f-ca5ad0e1d540" class="code_img_closed" src="http://images.cnblogs.com/OutliningIndicators/ContractedBlock.gif" alt="" /><img id="code_img_opened_9276a821-4675-47bd-a94f-ca5ad0e1d540" class="code_img_opened" style="display: none;" onclick="cnblogs_code_hide('9276a821-4675-47bd-a94f-ca5ad0e1d540',event)" src="http://images.cnblogs.com/OutliningIndicators/ExpandedBlockStart.gif" alt="" /><span class="cnblogs_code_collapse">VirtualizeChild</span>
<div id="cnblogs_code_open_9276a821-4675-47bd-a94f-ca5ad0e1d540" class="cnblogs_code_hide">
<pre><span style="color: #008080;"> 1</span> <span style="color: #808080;">///</span> <span style="color: #808080;">&lt;summary&gt;</span>
<span style="color: #008080;"> 2</span> <span style="color: #808080;">///</span><span style="color: #008000;"> 虚拟化子元素
</span><span style="color: #008080;"> 3</span> <span style="color: #808080;">///</span> <span style="color: #808080;">&lt;/summary&gt;</span>
<span style="color: #008080;"> 4</span> <span style="color: #808080;">///</span> <span style="color: #808080;">&lt;param name="itemIndex"&gt;</span><span style="color: #008000;">数据条目索引</span><span style="color: #808080;">&lt;/param&gt;</span>
<span style="color: #008080;"> 5</span> <span style="color: #0000ff;">public</span> <span style="color: #0000ff;">void</span> VirtualizeChild(<span style="color: #0000ff;">int</span><span style="color: #000000;"> itemIndex)
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 7</span>     IItemContainerGenerator generator = <span style="color: #0000ff;">this</span><span style="color: #000000;">.ItemContainerGenerator;
</span><span style="color: #008080;"> 8</span>     <span style="color: #0000ff;">var</span> childGeneratorPos =<span style="color: #000000;"> generator.GeneratorPositionFromIndex(itemIndex);
</span><span style="color: #008080;"> 9</span>     <span style="color: #0000ff;">if</span> (childGeneratorPos.Offset == <span style="color: #800080;">0</span><span style="color: #000000;">)
</span><span style="color: #008080;">10</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">11</span>         generator.Remove(childGeneratorPos, <span style="color: #800080;">1</span>); <span style="color: #008000;">//</span><span style="color: #008000;"> 虚拟化(从子元素UI容器中清除数据)</span>
<span style="color: #008080;">12</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">13</span> }</pre>
</div>
</div>
<p><span style="font-family: 微软雅黑; font-size: medium;">通过数据条目索引得出GeneratorPosition 信息，之后在11行调用generator的Remove方法即可实现元素的虚拟化。</span></p>
</div>
<div class="csharpcode">
<div class="csharpcode">

<div align="left"><span style="font-family: 微软雅黑; font-size: medium;">通过几张图片来有一个直观的认识，数据条目一共有10个，初始化时全部都为虚拟化状态：</span>
<pre><img style="background-image: none; padding-left: 0px; padding-right: 0px; display: inline; padding-top: 0px; border-width: 0px;" title="1" src="/assets/images/posts/cnblogs_com/talywy/201209/201209072222448804.png" alt="1" width="441" height="279" /></pre>

<span style="font-family: 微软雅黑; font-size: medium;">实例化第二个元素:</span>
<pre><img style="background-image: none; padding-left: 0px; padding-right: 0px; display: inline; padding-top: 0px; border-width: 0px;" title="2" src="/assets/images/posts/cnblogs_com/talywy/201209/201209072222537323.png" alt="2" width="445" height="281" /></pre>

<span style="font-family: 微软雅黑; font-size: medium;">增加实例化第三、七个元素：</span>
<pre><img style="background-image: none; padding-left: 0px; padding-right: 0px; display: inline; padding-top: 0px; border-width: 0px;" title="3" src="/assets/images/posts/cnblogs_com/talywy/201209/201209072223045.png" alt="3" width="449" height="284" /></pre>

<span style="font-family: 微软雅黑; font-size: medium;">虚拟化第二个元素：</span>
<pre><img style="background-image: none; padding-left: 0px; padding-right: 0px; display: inline; padding-top: 0px; border-width: 0px;" title="4" src="/assets/images/posts/cnblogs_com/talywy/201209/201209072223161848.png" alt="4" width="454" height="287" /></pre>
<span style="font-family: 微软雅黑; font-size: medium;">通过观察可以发现，<span style="color: #000000;"><strong>实例化的数据项位置信息按顺序从0开始依次增加，所有实例化的数据项位置信息的offset属性都是0，虚拟化数据项index和前一个最近的实例化元素index保持一致，offset依次增加</strong>。</span></span></div>

</div>
</div>
</div>
</div>
<h2 style="background: #4dc962; border: #cdc9f2 2px solid; padding: 5px;"><span style="color: #ffffff; font-family: 微软雅黑;">三、实战-实现一个虚拟化分页容器</span></h2>
<p style="text-indent: 30px;"><span style="font-family: 微软雅黑; font-size: medium;">了解了子元素自定义布局、数据项GeneratorPosition信息、虚拟化、实例化相关概念和实现方法后，离实现一个自定义虚拟容器还剩一步重要的工作：计算当前应该显示的数据项起止索引，实例化这些数据项，虚拟化不再显示的数据项。</span></p>
<p style="text-indent: 30px;">再前进一步，实现一个虚拟化分页容器：</p>
<p style="text-indent: 30px;"><img style="background-image: none; padding-left: 0px; padding-right: 0px; display: inline; padding-top: 0px; border-width: 0px;" title="5" src="/assets/images/posts/cnblogs_com/talywy/201209/201209072223268283.png" alt="5" width="244" height="230" /></p>
<p style="text-indent: 30px;">这个虚拟化分页容器有ChildWidth和ChildHeight两个依赖属性，用来定义容器中子元素的宽和高，这样在容器布局尺寸确定的情况下可以计算出可用布局下一共能显示多少个子元素，也就是PageSize属性。为容器指定一个有5000个数据的数据源，再提供一个分页控件用来控制分页容器的PageIndex，用来达到分页显示的效果。</p>
<p style="text-indent: 30px;">贴出主要代码：</p>
<div class="cnblogs_code" onclick="cnblogs_code_show('bd39b889-d821-44d1-9f6a-e44a59b5acb1')"><img id="code_img_closed_bd39b889-d821-44d1-9f6a-e44a59b5acb1" class="code_img_closed" src="http://images.cnblogs.com/OutliningIndicators/ContractedBlock.gif" alt="" /><img id="code_img_opened_bd39b889-d821-44d1-9f6a-e44a59b5acb1" class="code_img_opened" style="display: none;" onclick="cnblogs_code_hide('bd39b889-d821-44d1-9f6a-e44a59b5acb1',event)" src="http://images.cnblogs.com/OutliningIndicators/ExpandedBlockStart.gif" alt="" /><span class="cnblogs_code_collapse">计算需要实例化数据项的起止索引</span>
<div id="cnblogs_code_open_bd39b889-d821-44d1-9f6a-e44a59b5acb1" class="cnblogs_code_hide">
<pre><span style="color: #008080;"> 1</span> <span style="color: #808080;">///</span> <span style="color: #808080;">&lt;summary&gt;</span>
<span style="color: #008080;"> 2</span> <span style="color: #808080;">///</span><span style="color: #008000;"> 计算可是元素起止索引
</span><span style="color: #008080;"> 3</span> <span style="color: #808080;">///</span> <span style="color: #808080;">&lt;/summary&gt;</span>
<span style="color: #008080;"> 4</span> <span style="color: #808080;">///</span> <span style="color: #808080;">&lt;param name="availableSize"&gt;</span><span style="color: #008000;">可用布局尺寸</span><span style="color: #808080;">&lt;/param&gt;</span>
<span style="color: #008080;"> 5</span> <span style="color: #808080;">///</span> <span style="color: #808080;">&lt;param name="firstVisibleChildIndex"&gt;</span><span style="color: #008000;">第一个显示的子元素索引</span><span style="color: #808080;">&lt;/param&gt;</span>
<span style="color: #008080;"> 6</span> <span style="color: #808080;">///</span> <span style="color: #808080;">&lt;param name="lastVisibleChildIndex"&gt;</span><span style="color: #008000;">最后一个显示的子元素索引</span><span style="color: #808080;">&lt;/param&gt;</span>
<span style="color: #008080;"> 7</span> <span style="color: #0000ff;">private</span> <span style="color: #0000ff;">void</span> ComputeVisibleChildIndex(Size availableSize, <span style="color: #0000ff;">out</span> <span style="color: #0000ff;">int</span> firstVisibleChildIndex, <span style="color: #0000ff;">out</span> <span style="color: #0000ff;">int</span><span style="color: #000000;"> lastVisibleChildIndex)
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 9</span>     ItemsControl itemsControl = ItemsControl.GetItemsOwner(<span style="color: #0000ff;">this</span><span style="color: #000000;">);
</span><span style="color: #008080;">10</span> 
<span style="color: #008080;">11</span>     <span style="color: #0000ff;">if</span> (itemsControl != <span style="color: #0000ff;">null</span> &amp;&amp; itemsControl.Items != <span style="color: #0000ff;">null</span> &amp;&amp; ChildWidth &gt; <span style="color: #800080;">0</span> &amp;&amp; ChildHeight &gt; <span style="color: #800080;">0</span><span style="color: #000000;">)
</span><span style="color: #008080;">12</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">13</span>         ChildrenCount =<span style="color: #000000;"> itemsControl.Items.Count;
</span><span style="color: #008080;">14</span> 
<span style="color: #008080;">15</span>         _horizontalChildMaxCount = (<span style="color: #0000ff;">int</span>)(availableSize.Width /<span style="color: #000000;"> ChildWidth);
</span><span style="color: #008080;">16</span>         _verticalChildMaxCount = (<span style="color: #0000ff;">int</span>)(availableSize.Height /<span style="color: #000000;"> ChildHeight);
</span><span style="color: #008080;">17</span> 
<span style="color: #008080;">18</span>         PageSize = _horizontalChildMaxCount *<span style="color: #000000;"> _verticalChildMaxCount;
</span><span style="color: #008080;">19</span> 
<span style="color: #008080;">20</span>         <span style="color: #008000;">//</span><span style="color: #008000;"> 计算子元素显示起止索引</span>
<span style="color: #008080;">21</span>         firstVisibleChildIndex = PageIndex *<span style="color: #000000;"> PageSize;
</span><span style="color: #008080;">22</span>         lastVisibleChildIndex = Math.Min(ChildrenCount, firstVisibleChildIndex + PageSize) - <span style="color: #800080;">1</span><span style="color: #000000;">;
</span><span style="color: #008080;">23</span> 
<span style="color: #008080;">24</span>         Debug.WriteLine(<span style="color: #800000;">"</span><span style="color: #800000;">firstVisibleChildIndex:{0}, lastVisibleChildIndex{1}</span><span style="color: #800000;">"</span><span style="color: #000000;">, firstVisibleChildIndex, lastVisibleChildIndex)
</span><span style="color: #008080;">25</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">26</span>     <span style="color: #0000ff;">else</span>
<span style="color: #008080;">27</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">28</span>         ChildrenCount = <span style="color: #800080;">0</span><span style="color: #000000;">;
</span><span style="color: #008080;">29</span>         firstVisibleChildIndex = -<span style="color: #800080;">1</span><span style="color: #000000;">;
</span><span style="color: #008080;">30</span>         lastVisibleChildIndex = -<span style="color: #800080;">1</span><span style="color: #000000;">;
</span><span style="color: #008080;">31</span>         PageSize = <span style="color: #800080;">0</span><span style="color: #000000;">;
</span><span style="color: #008080;">32</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">33</span> }</pre>
</div>
</div>
<div class="cnblogs_code" onclick="cnblogs_code_show('a3755f35-debc-4db5-9999-1bca8d193256')"><img id="code_img_closed_a3755f35-debc-4db5-9999-1bca8d193256" class="code_img_closed" src="http://images.cnblogs.com/OutliningIndicators/ContractedBlock.gif" alt="" /><img id="code_img_opened_a3755f35-debc-4db5-9999-1bca8d193256" class="code_img_opened" style="display: none;" onclick="cnblogs_code_hide('a3755f35-debc-4db5-9999-1bca8d193256',event)" src="http://images.cnblogs.com/OutliningIndicators/ExpandedBlockStart.gif" alt="" /><span class="cnblogs_code_collapse">测量子元素布局期望尺寸及数据项实例化</span>
<div id="cnblogs_code_open_a3755f35-debc-4db5-9999-1bca8d193256" class="cnblogs_code_hide">
<pre><span style="color: #008080;"> 1</span> <span style="color: #808080;">///</span> <span style="color: #808080;">&lt;summary&gt;</span>
<span style="color: #008080;"> 2</span> <span style="color: #808080;">///</span><span style="color: #008000;"> 测量子元素布局,生成需要显示的子元素
</span><span style="color: #008080;"> 3</span> <span style="color: #808080;">///</span> <span style="color: #808080;">&lt;/summary&gt;</span>
<span style="color: #008080;"> 4</span> <span style="color: #808080;">///</span> <span style="color: #808080;">&lt;param name="availableSize"&gt;</span><span style="color: #008000;">可用布局尺寸</span><span style="color: #808080;">&lt;/param&gt;</span>
<span style="color: #008080;"> 5</span> <span style="color: #808080;">///</span> <span style="color: #808080;">&lt;param name="firstVisibleChildIndex"&gt;</span><span style="color: #008000;">第一个显示的子元素索引</span><span style="color: #808080;">&lt;/param&gt;</span>
<span style="color: #008080;"> 6</span> <span style="color: #808080;">///</span> <span style="color: #808080;">&lt;param name="lastVisibleChildIndex"&gt;</span><span style="color: #008000;">最后一个显示的子元素索引</span><span style="color: #808080;">&lt;/param&gt;</span>
<span style="color: #008080;"> 7</span> <span style="color: #0000ff;">private</span> <span style="color: #0000ff;">void</span> MeasureChild(Size availableSize, <span style="color: #0000ff;">int</span> firstVisibleChildIndex, <span style="color: #0000ff;">int</span><span style="color: #000000;"> lastVisibleChildIndex)
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 9</span>     <span style="color: #0000ff;">if</span> (firstVisibleChildIndex &lt; <span style="color: #800080;">0</span><span style="color: #000000;">)
</span><span style="color: #008080;">10</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">11</span>         <span style="color: #0000ff;">return</span><span style="color: #000000;">;
</span><span style="color: #008080;">12</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">13</span> 
<span style="color: #008080;">14</span>     <span style="color: #008000;">//</span><span style="color: #008000;"> 注意，在第一次使用 ItemContainerGenerator之前要先访问一下InternalChildren, 
</span><span style="color: #008080;">15</span>     <span style="color: #008000;">//</span><span style="color: #008000;"> 否则ItemContainerGenerator为null，是一个Bug</span>
<span style="color: #008080;">16</span>     UIElementCollection children =<span style="color: #000000;"> InternalChildren;
</span><span style="color: #008080;">17</span>     IItemContainerGenerator generator =<span style="color: #000000;"> ItemContainerGenerator;
</span><span style="color: #008080;">18</span> 
<span style="color: #008080;">19</span>     <span style="color: #008000;">//</span><span style="color: #008000;"> 获取第一个可视元素位置信息</span>
<span style="color: #008080;">20</span>     GeneratorPosition position =<span style="color: #000000;"> generator.GeneratorPositionFromIndex(firstVisibleChildIndex);
</span><span style="color: #008080;">21</span>     <span style="color: #008000;">//</span><span style="color: #008000;"> 根据元素位置信息计算子元素索引</span>
<span style="color: #008080;">22</span>     <span style="color: #0000ff;">int</span> childIndex = position.Offset == <span style="color: #800080;">0</span> ? position.Index : position.Index + <span style="color: #800080;">1</span><span style="color: #000000;">;
</span><span style="color: #008080;">23</span> 
<span style="color: #008080;">24</span>     <span style="color: #0000ff;">using</span> (generator.StartAt(position, GeneratorDirection.Forward, <span style="color: #0000ff;">true</span><span style="color: #000000;">))
</span><span style="color: #008080;">25</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">26</span>         <span style="color: #0000ff;">for</span> (<span style="color: #0000ff;">int</span> itemIndex = firstVisibleChildIndex; itemIndex &lt;= lastVisibleChildIndex; itemIndex++, childIndex++<span style="color: #000000;">)
</span><span style="color: #008080;">27</span> <span style="color: #000000;">        {
</span><span style="color: #008080;">28</span>             <span style="color: #0000ff;">bool</span> isNewlyRealized;   <span style="color: #008000;">//</span><span style="color: #008000;"> 用以指示新生成的元素是否是新实体化的
</span><span style="color: #008080;">29</span> 
<span style="color: #008080;">30</span>             <span style="color: #008000;">//</span><span style="color: #008000;"> 生成下一个子元素</span>
<span style="color: #008080;">31</span>             <span style="color: #0000ff;">var</span> child = (UIElement)generator.GenerateNext(<span style="color: #0000ff;">out</span><span style="color: #000000;"> isNewlyRealized);
</span><span style="color: #008080;">32</span> 
<span style="color: #008080;">33</span>             <span style="color: #0000ff;">if</span><span style="color: #000000;"> (isNewlyRealized)
</span><span style="color: #008080;">34</span> <span style="color: #000000;">            {
</span><span style="color: #008080;">35</span>                 <span style="color: #0000ff;">if</span> (childIndex &gt;=<span style="color: #000000;"> children.Count)
</span><span style="color: #008080;">36</span> <span style="color: #000000;">                {
</span><span style="color: #008080;">37</span> <span style="color: #000000;">                    AddInternalChild(child);
</span><span style="color: #008080;">38</span> <span style="color: #000000;">                }
</span><span style="color: #008080;">39</span>                 <span style="color: #0000ff;">else</span>
<span style="color: #008080;">40</span> <span style="color: #000000;">                {
</span><span style="color: #008080;">41</span> <span style="color: #000000;">                    InsertInternalChild(childIndex, child);
</span><span style="color: #008080;">42</span> <span style="color: #000000;">                }
</span><span style="color: #008080;">43</span> <span style="color: #000000;">                generator.PrepareItemContainer(child);
</span><span style="color: #008080;">44</span> <span style="color: #000000;">            }
</span><span style="color: #008080;">45</span> 
<span style="color: #008080;">46</span>             <span style="color: #008000;">//</span><span style="color: #008000;"> 测算子元素布局</span>
<span style="color: #008080;">47</span> <span style="color: #000000;">            child.Measure(availableSize);
</span><span style="color: #008080;">48</span> <span style="color: #000000;">        }
</span><span style="color: #008080;">49</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">50</span> }</pre>
</div>
</div>
<div class="cnblogs_code" onclick="cnblogs_code_show('25d338df-4f94-467c-af16-200c0da23377')"><img id="code_img_closed_25d338df-4f94-467c-af16-200c0da23377" class="code_img_closed" src="http://images.cnblogs.com/OutliningIndicators/ContractedBlock.gif" alt="" /><img id="code_img_opened_25d338df-4f94-467c-af16-200c0da23377" class="code_img_opened" style="display: none;" onclick="cnblogs_code_hide('25d338df-4f94-467c-af16-200c0da23377',event)" src="http://images.cnblogs.com/OutliningIndicators/ExpandedBlockStart.gif" alt="" /><span class="cnblogs_code_collapse">清理不再显示的子元素</span>
<div id="cnblogs_code_open_25d338df-4f94-467c-af16-200c0da23377" class="cnblogs_code_hide">
<pre><span style="color: #008080;"> 1</span> <span style="color: #808080;">///</span> <span style="color: #808080;">&lt;summary&gt;</span>
<span style="color: #008080;"> 2</span> <span style="color: #808080;">///</span><span style="color: #008000;"> 清理不需要显示的子元素
</span><span style="color: #008080;"> 3</span> <span style="color: #808080;">///</span> <span style="color: #808080;">&lt;/summary&gt;</span>
<span style="color: #008080;"> 4</span> <span style="color: #808080;">///</span> <span style="color: #808080;">&lt;param name="firstVisibleChildIndex"&gt;</span><span style="color: #008000;">第一个显示的子元素索引</span><span style="color: #808080;">&lt;/param&gt;</span>
<span style="color: #008080;"> 5</span> <span style="color: #808080;">///</span> <span style="color: #808080;">&lt;param name="lastVisibleChildIndex"&gt;</span><span style="color: #008000;">最后一个显示的子元素索引</span><span style="color: #808080;">&lt;/param&gt;</span>
<span style="color: #008080;"> 6</span> <span style="color: #0000ff;">private</span> <span style="color: #0000ff;">void</span> CleanUpItems(<span style="color: #0000ff;">int</span> firstVisibleChildIndex, <span style="color: #0000ff;">int</span><span style="color: #000000;"> lastVisibleChildIndex)
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 8</span>     UIElementCollection children = <span style="color: #0000ff;">this</span><span style="color: #000000;">.InternalChildren;
</span><span style="color: #008080;"> 9</span>     IItemContainerGenerator generator = <span style="color: #0000ff;">this</span><span style="color: #000000;">.ItemContainerGenerator;
</span><span style="color: #008080;">10</span> 
<span style="color: #008080;">11</span>     <span style="color: #008000;">//</span><span style="color: #008000;"> 清除不需要显示的子元素，注意从集合后向前操作，以免造成操作过程中元素索引发生改变</span>
<span style="color: #008080;">12</span>     <span style="color: #0000ff;">for</span> (<span style="color: #0000ff;">int</span> i = children.Count - <span style="color: #800080;">1</span>; i &gt; -<span style="color: #800080;">1</span>; i--<span style="color: #000000;">)
</span><span style="color: #008080;">13</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">14</span>         <span style="color: #008000;">//</span><span style="color: #008000;"> 通过已显示的子元素的位置信息得出元素索引</span>
<span style="color: #008080;">15</span>         <span style="color: #0000ff;">var</span> childGeneratorPos = <span style="color: #0000ff;">new</span> GeneratorPosition(i, <span style="color: #800080;">0</span><span style="color: #000000;">);
</span><span style="color: #008080;">16</span>         <span style="color: #0000ff;">int</span> itemIndex =<span style="color: #000000;"> generator.IndexFromGeneratorPosition(childGeneratorPos);
</span><span style="color: #008080;">17</span> 
<span style="color: #008080;">18</span>         <span style="color: #008000;">//</span><span style="color: #008000;"> 移除不再显示的元素</span>
<span style="color: #008080;">19</span>         <span style="color: #0000ff;">if</span> (itemIndex &lt; firstVisibleChildIndex || itemIndex &gt;<span style="color: #000000;"> lastVisibleChildIndex)
</span><span style="color: #008080;">20</span> <span style="color: #000000;">        {
</span><span style="color: #008080;">21</span>             generator.Remove(childGeneratorPos, <span style="color: #800080;">1</span><span style="color: #000000;">);
</span><span style="color: #008080;">22</span>             RemoveInternalChildRange(i, <span style="color: #800080;">1</span><span style="color: #000000;">);
</span><span style="color: #008080;">23</span> <span style="color: #000000;">        }
</span><span style="color: #008080;">24</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">25</span> }</pre>
</div>
</div>
<p>&nbsp;</p>
<p>参考文章:</p>
<p><a href="http://blogs.msdn.com/b/dancre/archive/2006/02/06/526310.aspx">http://blogs.msdn.com/b/dancre/archive/2006/02/06/526310.aspx</a> (写的非常好)</p>
<p>&nbsp;</p>
<p>附上<a href="/assets/attach/talywy/VirtualizingPanelDemot.zip">源代码</a></p>
<p>&nbsp;</p>
<p><strong>版权说明：</strong><strong>本文章版权归本人及博客园共同所有，未经允许请勿用于任何商业用途。转载请标明原文出处:</strong></p>
<p><strong><a id="Editor_Edit_hlEntryLink" title="view: WPF中实现自定义虚拟容器(实现VirtualizingPanel)" href="http://www.cnblogs.com/talywy/archive/2012/09/07/CustomVirtualizingPanel.html" target="_blank">http://www.cnblogs.com/talywy/archive/2012/09/07/CustomVirtualizingPanel.html</a><span>&nbsp;</span>。</strong></p>