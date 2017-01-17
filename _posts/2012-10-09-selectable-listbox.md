---
layout: post
title: 可框选的ListBox
alias: [/2012/10/09/]
tags: WPF
---

 30px;"><span style="font-family: 微软雅黑; font-size: medium;">最近项目当中遇到一个需要有数据条目框选功能的ListBox，写了一个简单的Demo。效果如下：</span></p>
<div id="scid:8747F07C-CDE8-481f-B0DF-C6CFD074BF67:24421259-7eb1-42d9-8a5c-c7de0746ffa6" class="wlWriterEditableSmartContent" style="margin: 0px; display: block; padding: 0px;"><a title="DragSelectListBox" href="/assets/images/posts/cnblogs_com/talywy/201210/201210092306044624.png" rel="thumbnail"><img src="/assets/images/posts/cnblogs_com/talywy/201210/201210092306053064.png" alt="" width="420" height="331" border="0" /></a></div>
<p style="text-indent: 30px;"><span style="font-size: medium;"><span style="font-family: 微软雅黑;">要想实现这样的效果主要要实现以下两点：</span></span></p>
<p style="text-indent: 30px;"><strong><span style="font-size: medium;"><span style="font-family: 微软雅黑;">1、选择框的绘制</span></span></strong></p>
<p style="text-indent: 30px;"><strong><span style="font-size: medium;"><span style="font-family: 微软雅黑;">2、绘制过程中计算与选择框相交的Item。</span></span></strong></p>
<p style="text-indent: 30px;"><span style="font-family: 微软雅黑; font-size: medium;">矩形选择框的绘制，实现原理比较简单，按照下面的方式定义ListBox的模板，这样可以在Thumb的DragDelta事件中方便的计算出拖动时矩形选择框的位置和大小信息进行绘制。</span></p>
<p style="text-indent: 30px;"><span style="font-family: 微软雅黑; font-size: medium;">ListBox模板内容：</span></p>
<div class="cnblogs_code">
<pre><span style="color: #008080;"> 1</span> <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">Grid</span><span style="color: #0000ff;">&gt;</span>
<span style="color: #008080;"> 2</span>     <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">Thumb </span><span style="color: #ff0000;">Name</span><span style="color: #0000ff;">="PART_DragThumb"</span><span style="color: #ff0000;"> Template</span><span style="color: #0000ff;">="</span><span style="color: #808000;">{StaticResource DragThumbTemplate}</span><span style="color: #0000ff;">"</span> <span style="color: #0000ff;">/&gt;</span>
<span style="color: #008080;"> 3</span>     <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">WrapPanel </span><span style="color: #ff0000;">IsItemsHost</span><span style="color: #0000ff;">="True"</span><span style="color: #ff0000;"> Orientation</span><span style="color: #0000ff;">="Horizontal"</span> <span style="color: #0000ff;">/&gt;</span>
<span style="color: #008080;"> 4</span>     <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">Canvas </span><span style="color: #ff0000;">Name</span><span style="color: #0000ff;">="PanelParent"</span><span style="color: #ff0000;"> ClipToBounds</span><span style="color: #0000ff;">="True"</span><span style="color: #0000ff;">&gt;</span>
<span style="color: #008080;"> 5</span>         <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">Rectangle </span><span style="color: #ff0000;">Name</span><span style="color: #0000ff;">="PART_SelectArea"</span> 
<span style="color: #008080;"> 6</span> <span style="color: #ff0000;">                   Width</span><span style="color: #0000ff;">="0"</span><span style="color: #ff0000;"> Height</span><span style="color: #0000ff;">="0"</span>
<span style="color: #008080;"> 7</span> <span style="color: #ff0000;">                   Fill</span><span style="color: #0000ff;">="#6ca3a3a3"</span><span style="color: #ff0000;"> Stroke</span><span style="color: #0000ff;">="LightBlue"</span>
<span style="color: #008080;"> 8</span> <span style="color: #ff0000;">                   StrokeThickness</span><span style="color: #0000ff;">="1"</span> <span style="color: #0000ff;">/&gt;</span>
<span style="color: #008080;"> 9</span>     <span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">Canvas</span><span style="color: #0000ff;">&gt;</span>
<span style="color: #008080;">10</span> <span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">Grid</span><span style="color: #0000ff;">&gt;</span></pre>
</div>
<p style="text-indent: 30px;">&nbsp;<span style="font-family: 微软雅黑; font-size: medium;">DragDelta事件：</span></p>
<div class="cnblogs_code">
<pre><span style="color: #008080;"> 1</span>  <span style="color: #808080;">///</span> <span style="color: #808080;">&lt;summary&gt;</span>
<span style="color: #008080;"> 2</span>  <span style="color: #808080;">///</span><span style="color: #008000;"> 拖拽
</span><span style="color: #008080;"> 3</span>  <span style="color: #808080;">///</span> <span style="color: #808080;">&lt;/summary&gt;</span>
<span style="color: #008080;"> 4</span>  <span style="color: #0000ff;">private</span> <span style="color: #0000ff;">void</span> ThumbDragDelta(<span style="color: #0000ff;">object</span><span style="color: #000000;"> sender, DragDeltaEventArgs e)
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;"> {
</span><span style="color: #008080;"> 6</span>      <span style="color: #008000;">//</span><span style="color: #008000;"> 绘制选择框</span>
<span style="color: #008080;"> 7</span>      <span style="color: #0000ff;">if</span> (e.HorizontalChange &lt; <span style="color: #800080;">0</span><span style="color: #000000;">)
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">     {
</span><span style="color: #008080;"> 9</span>          <span style="color: #0000ff;">var</span> right = Canvas.GetLeft(_selectArea) +<span style="color: #000000;"> _selectArea.Width;
</span><span style="color: #008080;">10</span>          Canvas.SetLeft(_selectArea, right +<span style="color: #000000;"> e.HorizontalChange);
</span><span style="color: #008080;">11</span> <span style="color: #000000;">     }
</span><span style="color: #008080;">12</span> 
<span style="color: #008080;">13</span>      <span style="color: #0000ff;">if</span> (e.VerticalChange &lt; <span style="color: #800080;">0</span><span style="color: #000000;">)
</span><span style="color: #008080;">14</span> <span style="color: #000000;">     {
</span><span style="color: #008080;">15</span>          <span style="color: #0000ff;">var</span> bottom = Canvas.GetTop(_selectArea) +<span style="color: #000000;"> _selectArea.Height;
</span><span style="color: #008080;">16</span>          Canvas.SetTop(_selectArea, bottom +<span style="color: #000000;"> e.VerticalChange);
</span><span style="color: #008080;">17</span> <span style="color: #000000;">     }
</span><span style="color: #008080;">18</span> 
<span style="color: #008080;">19</span>      _selectArea.Width =<span style="color: #000000;"> Math.Abs(e.HorizontalChange);
</span><span style="color: #008080;">20</span>      _selectArea.Height =<span style="color: #000000;"> Math.Abs(e.VerticalChange);
</span><span style="color: #008080;">21</span>  }</pre>
</div>
<p style="text-indent: 30px;">&nbsp;<span style="font-family: 微软雅黑; font-size: medium;">每当绘制矩形框后，需要计算出哪些数据项和所绘制的矩形框相交，并将与选择框区域相交的数据项容器附加属性IsDragSelected为true，之后再利用该属性在ListBox的ItemContainerStyle中使用触发器实现选中效果即可，代码如下：</span>&nbsp;</p>
<div class="cnblogs_code">
<pre><span style="color: #008080;"> 1</span>   <span style="color: #008000;">//</span><span style="color: #008000;"> 选择框区域信息</span>
<span style="color: #008080;"> 2</span>   <span style="color: #0000ff;">var</span> selectAreaLocation = <span style="color: #0000ff;">new</span><span style="color: #000000;"> Point(Canvas.GetLeft(_selectArea), Canvas.GetTop(_selectArea));
</span><span style="color: #008080;"> 3</span>   <span style="color: #0000ff;">var</span> selectAreaSize = <span style="color: #0000ff;">new</span><span style="color: #000000;"> Size(_selectArea.Width, _selectArea.Height);
</span><span style="color: #008080;"> 4</span>   <span style="color: #0000ff;">var</span> selectRect = <span style="color: #0000ff;">new</span><span style="color: #000000;"> Rect(selectAreaLocation, selectAreaSize);
</span><span style="color: #008080;"> 5</span>   Debug.WriteLine(<span style="color: #800000;">"</span><span style="color: #800000;">selectRect:{0}</span><span style="color: #800000;">"</span><span style="color: #000000;">, selectRect);
</span><span style="color: #008080;"> 6</span> 
<span style="color: #008080;"> 7</span>   <span style="color: #0000ff;">foreach</span> (<span style="color: #0000ff;">var</span> item <span style="color: #0000ff;">in</span> <span style="color: #0000ff;">this</span><span style="color: #000000;">.Items)
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">  {
</span><span style="color: #008080;"> 9</span>       <span style="color: #0000ff;">var</span> container = <span style="color: #0000ff;">this</span>.ItemContainerGenerator.ContainerFromItem(item) <span style="color: #0000ff;">as</span><span style="color: #000000;"> ContentControl;
</span><span style="color: #008080;">10</span>       <span style="color: #0000ff;">if</span> (container != <span style="color: #0000ff;">null</span><span style="color: #000000;">)
</span><span style="color: #008080;">11</span> <span style="color: #000000;">      {
</span><span style="color: #008080;">12</span>           <span style="color: #0000ff;">var</span> transform = container.TransformToAncestor(<span style="color: #0000ff;">this</span><span style="color: #000000;">);
</span><span style="color: #008080;">13</span>           <span style="color: #0000ff;">var</span> location = transform.Transform(<span style="color: #0000ff;">new</span><span style="color: #000000;"> Point());
</span><span style="color: #008080;">14</span> 
<span style="color: #008080;">15</span>           <span style="color: #008000;">//</span><span style="color: #008000;"> 数据项容器区域信息</span>
<span style="color: #008080;">16</span>           <span style="color: #0000ff;">var</span> containerRect = <span style="color: #0000ff;">new</span> Rect(location, <span style="color: #0000ff;">new</span><span style="color: #000000;"> Size(container.ActualWidth, container.ActualHeight));
</span><span style="color: #008080;">17</span>           Debug.WriteLine(<span style="color: #800000;">"</span><span style="color: #800000;">containerRect:{0}</span><span style="color: #800000;">"</span><span style="color: #000000;">, containerRect);
</span><span style="color: #008080;">18</span> <span style="color: #000000;">          SetIsDragSelected(container, selectRect.IntersectsWith(containerRect));
</span><span style="color: #008080;">19</span>       }</pre>
</div>
<p style="text-indent: 30px;">&nbsp;<span style="font-family: 微软雅黑; font-size: medium;">上面之所以没有直接设置数据项容器的IsSelected属性，是因为不想将框选和ListBox默认的选择混在一起，Demo中在Thumb的DragCompleted事件里找出IsDragSelected附加属性为true的数据项，并将这些数据用事件参数向外抛出，具体的操作放在事件中。</span></p>
<p style="text-indent: 30px;"><span style="font-family: 微软雅黑; font-size: medium;">PS：最后，由于DragSelectListBox中各个数据项容器间的间距较小，导致框选触发不易实现，所以需要在ItemTemplate中做下处理，方法如下：</span></p>
<div class="cnblogs_code">
<pre><span style="color: #008080;"> 1</span>  <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">DataTemplate</span><span style="color: #0000ff;">&gt;</span>
<span style="color: #008080;"> 2</span>      <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">Grid</span><span style="color: #0000ff;">&gt;</span>
<span style="color: #008080;"> 3</span>          <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">Border </span><span style="color: #ff0000;">IsHitTestVisible</span><span style="color: #0000ff;">="False"</span> 
<span style="color: #008080;"> 4</span> <span style="color: #ff0000;">                 BorderBrush</span><span style="color: #0000ff;">="LightBlue"</span><span style="color: #ff0000;"> BorderThickness</span><span style="color: #0000ff;">="1"</span> 
<span style="color: #008080;"> 5</span> <span style="color: #ff0000;">                 Width</span><span style="color: #0000ff;">="50"</span><span style="color: #ff0000;"> Height</span><span style="color: #0000ff;">="50"</span><span style="color: #ff0000;"> Background</span><span style="color: #0000ff;">="AliceBlue"</span><span style="color: #0000ff;">&gt;</span>
<span style="color: #008080;"> 6</span>              <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">TextBlock </span><span style="color: #ff0000;">Text</span><span style="color: #0000ff;">="</span><span style="color: #808000;">{Binding}</span><span style="color: #0000ff;">"</span><span style="color: #ff0000;"> HorizontalAlignment</span><span style="color: #0000ff;">="Center"</span><span style="color: #ff0000;"> VerticalAlignment</span><span style="color: #0000ff;">="Center"</span><span style="color: #0000ff;">/&gt;</span>
<span style="color: #008080;"> 7</span>          <span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">Border</span><span style="color: #0000ff;">&gt;</span>
<span style="color: #008080;"> 8</span>          <span style="color: #0000ff;">&lt;</span><span style="color: #800000;">Rectangle </span><span style="color: #ff0000;">Margin</span><span style="color: #0000ff;">="5"</span><span style="color: #ff0000;"> Fill</span><span style="color: #0000ff;">="Transparent"</span> <span style="color: #0000ff;">/&gt;</span>
<span style="color: #008080;"> 9</span>      <span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">Grid</span><span style="color: #0000ff;">&gt;</span>
<span style="color: #008080;">10</span>  <span style="color: #0000ff;">&lt;/</span><span style="color: #800000;">DataTemplate</span><span style="color: #0000ff;">&gt;</span></pre>
</div>
<p style="text-indent: 30px;">&nbsp;<span style="font-family: 微软雅黑; font-size: medium;">第3行设置Border的IsHitTestVisible属性为False, 然后再放一个Margin为5的Rectangle，这样每个数据项容器边缘都会多出5像素的可触发框选区域，使框选更容易触发。</span></p>
<p>附上<a href="/assets/attach/talywy/DragSelectTest.zip">源代码</a></p>
<p><strong>版权说明：</strong><strong>本文章版权归本人及博客园共同所有，未经允许请勿用于任何商业用途。转载请标明原文出处:</strong></p>
<p><strong><a href="http://www.cnblogs.com/talywy/archive/2012/10/09/DragSelectListBox.html"><span>http://www.cnblogs.com/talywy/archive/2012/10/09/DragSelectListBox.html&nbsp;</span></a>。</strong></p>