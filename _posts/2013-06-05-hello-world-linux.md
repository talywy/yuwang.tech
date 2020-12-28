---
layout: post
title: "HelloWorld - Linux"
description: "Create the first c program on linux."
categories: [记录]
tags: [Linux, C]
alias: [/2013/06/05/]
---
* Kramdown table of contents
{:toc .toc}

<style type="text/css"> pre { background-color: #eee;  color: black; }</style>

<div class="postBody">
                
<div id="cnblogs_post_body" class="blogpost-body">
<p>说明：本文基于Centos 6.4 32位操作系统(<a href="http://centos.ustc.edu.cn/centos/6.4/isos/i386/CentOS-6.4-i386-LiveDVD.iso">CentOS-6.4-i386-LiveDVD.iso</a>)<p>

<h2>一、编写HelloWorld源码</h2>

<p>远程连接到Centos机器上，先建立一个文件夹用来存放源码：</p>
<p>使用mkdir 建立目录 (<em>-p参数指定当父目录不存在时先创建父目录</em>)</p>
<p>使用cd命令切换到刚才建立的目录下。</p>
<p><img style="margin-left: 0; display: inline; margin-right: 0; border-width: 0" title="01" src="/assets/images/posts/cnblogs_com/talywy/201306/05222704-5937945efe9c440786a2fd5d89f24972.png" alt="01" width="551" height="48"></p>
<p>使用Centos预装的Vim文本编辑器创建HelloWorld.c源码，输入经典的HelloWorld源代码。</p>

<pre><span style="color: rgba(0, 128, 128, 1)">1</span>    #include &lt;stdio.h&gt;
<span style="color: rgba(0, 128, 128, 1)">2</span>   
<span style="color: rgba(0, 128, 128, 1)">3</span>    <span style="color: rgba(0, 0, 255, 1)">int</span><span style="color: rgba(0, 0, 0, 1)"> main()
</span><span style="color: rgba(0, 128, 128, 1)">4</span>   <span style="color: rgba(0, 0, 0, 1)"> {
</span><span style="color: rgba(0, 128, 128, 1)">5</span>        printf(<span style="color: rgba(128, 0, 0, 1)">"</span><span style="color: rgba(128, 0, 0, 1)">Hello World!\n</span><span style="color: rgba(128, 0, 0, 1)">"</span><span style="color: rgba(0, 0, 0, 1)">);
</span><span style="color: rgba(0, 128, 128, 1)">6</span>        <span style="color: rgba(0, 0, 255, 1)">return</span> <span style="color: rgba(128, 0, 128, 1)">0</span><span style="color: rgba(0, 0, 0, 1)">;
</span><span style="color: rgba(0, 128, 128, 1)">7</span>    }</pre>
<p>输入完毕后保存为HelloWorld.c文件。</p>

<h2>二、安装GCC</h2>

<p>回到控制台输入gcc命令，判断机器上有没有安装gcc编译器，如果没有安装的话则会出现下面的提示：</p>
<p>&nbsp;<img style="display: inline; border-width: 0" title="02" src="/assets/images/posts/cnblogs_com/talywy/201306/05222704-68cdbdb32f514569b58404198d4e99ae.png" alt="02" width="295" height="28"></p>
<p>要安装gcc很容易。<span style="color: rgba(255, 0, 0, 1)">联网状态</span>下输入yum install gcc 来安装gcc:</p>
<p><img style="display: inline; border-width: 0" title="03" src="/assets/images/posts/cnblogs_com/talywy/201306/05222707-c42ac63c7c3b409eac37e05c4c68509a.png" alt="03" width="654" height="100"></p>
<p>系统会自动检查需要安装的组件，并在检查完毕后给出提示需要安装那些组件包，并告知需要下载的组件包总大小和安装需占用的磁盘空间:</p>
<p><img style="display: inline; border-width: 0" title="04" src="/assets/images/posts/cnblogs_com/talywy/201306/05222712-3ead811cbf714a40948bd638f1efcf4c.png" alt="04" width="656" height="224"></p>
<p>按y确认后，系统则会下载需要的组件包并进行安装。安装成功后会出现Complete提示，此时输入gcc -v命令则可查看安装的gcc版本。</p>
<p><img style="display: inline; border-width: 0" title="05" src="/assets/images/posts/cnblogs_com/talywy/201306/05222718-b786e6d7008447a79f637ed60f256134.png" alt="05" width="654" height="111" ></p>

<h2>三、编译源码</h2>
<p>如果前面的操作都顺利的话，当前的工作目录应该还在:</p>
<p style="border: 1px solid rgba(195, 195, 195, 1); padding: 5px">/home/root/study/cplusplus/test/HelloWorld</p>
<p>如果不确定的话，可以输入pwd命令来输出当前工作目录。如果当前目录不是上面显示的目录，可以使用cd命令切换到上面的目录。</p>
<p>命令行中输入gcc –o HelloWorld HelloWorld.c执行编译链接。如果一切正常的话，输入ll 命令此，则会看到在当前目录下会多出一个HelloWorld文件。该文件就是生成的可执行文件。</p>
<p><img style="display: inline; border-width: 0" title="06" src="/assets/images/posts/cnblogs_com/talywy/201306/05222719-739faca92936453da80fe66328fcc868.png" alt="06" width="375" height="61"></p>


<h2>四、运行程序</h2>
<p>直接在当前目录下输入./HelloWorld即可看见经典的“Hello World ”输出到屏幕上了。</p>
<p><img style="display: inline; border-width: 0" title="07" src="/assets/images/posts/cnblogs_com/talywy/201306/05222720-1c83d75a46fd4033b265a136412a0183.png" alt="07" width="314" height="31"></p>
<p>需要说明的是，在Linux系统中如果要成功执行一个程序。那么该程序对当前用户来讲<span style="color: rgba(255, 0, 0, 1)">必须要有执行的权限</span>，“<a href="#flag">编译源码</a>”一节图片中红色区域表示HelloWorld这个文件对于root用户的权限是:读、写、执行，对应root用户组成员的权限是读、执行，对于其他用户的权限也是读、执行。为了验证，我们做如下操作：(<strong>说明：需先创建一个普通用户且不在root组中，此文中该普通用户名是Taly</strong>)</p>
<p>输入su Taly，切换到普通用户下，输入./HelloWorld，程序正常执行。回到root用户角色下，输入命令</p>
<p>chmod 754 HelloWorld 去除其他用户的执行权限，再次使用Taly运行./HelloWorld，此时报权限不足的错误。具体流程如下图:</p>
<p><img style="display: inline; border: 0" title="08" src="/assets/images/posts/cnblogs_com/talywy/201306/05222727-e9d12468495a457ca5343b0306cd5ce1.png" alt="08" width="477" ></p>
<p>&nbsp;</p>
<p><strong>版权说明：</strong><strong>本文章版权归本人及博客园共同所有，未经允许请勿用于任何商业用途。欢迎转载，转载请标明原文出处:</strong></p>
<p><a href="http://www.cnblogs.com/talywy/archive/2013/06/05/3120036.html">http://www.cnblogs.com/talywy/archive/2013/06/05/3120036.html</a></p>