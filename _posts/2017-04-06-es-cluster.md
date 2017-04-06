---
layout: post
title: "ElasticSearch Cluster"
description: "How to setup elasticsearch cluster"
categories: other
tags: es elasticsearch cluster
alias: [/2017/04/06/]
---
* Kramdown table of contents
{:toc .toc}

# 0x01 序
{: #intro}
记录ElasticSearch集群搭建方式, 阅读本文以前，需要读者具备ES5.x版本的安装经验。如果不熟悉ES5.X版本的安装，可先参考[这篇文章][begin-es]。

# 0x02 安装
{: #install}

## 本文使用的环境说明及依赖
{: #env}
* **OS**： `CentOS release 6.8`
* **git**: `1.7.1(CentOS release 6.8)` or `2.7.0 (Windows 10)`
* **jre**: 1.8
* **es**: 5.0 rtf版

## 安装步骤
{: #setup}

### 系统环境设置
{: #env}
开启集群模式，es启动时会自动检查系统环境设置

* 打开文件数及线程数限制
在/etc/security/limits.conf文件中增加

~~~
*        soft   nproc  65536
*        hard   nproc  65536
*        soft   nofile  65536
*        hard   nofile  65536
~~~

* 增加虚拟内存MAP空间数，
在/etc/sysctl.conf文件中增加

~~~
vm.max_map_count = 262144
vm.swappiness = 1
~~~

* 关闭swap交换区
**临时关闭**：sudo swapoff -a
**永久关闭**：打开`/etc/fstab`文件中包含`swap`关键字的行注释

### es配置
{: #es-config}
修改conf/elasticsearch.yml文件。

本文节点部署的结构图如下：

![es](/assets/images/posts/es_cluster/es.png)

在/etc/hosts文件中添加映射

~~~
192.168.1.100 es-server01
192.168.1.101 es-server02
~~~

节点1的配置

~~~
# 修改集群名称
cluster.name: elasticsearch-cluster

# 节点名称
node.name: es01-node-1

# 绑定的主机地址
network.host: es-server01,

# 节点胡发现地址（集群中的每个节点都要部署，默认使用的是9300端口）
discovery.zen.ping.unicast.hosts: ["es-server01:9300", "es-server02:9300"]
~~~

节点2的配置

~~~
# 修改集群名称
cluster.name: elasticsearch-cluster

# 节点名称
node.name: es02-node-1

# 绑定的主机地址
network.host: es-server02,

# 节点胡发现地址（集群中的每个节点都要部署，默认使用的是9300端口）
discovery.zen.ping.unicast.hosts: ["es-server01:9300", "es-server02:9300"]
~~~


### 启动集群
{: #es-start}

* sudo useradd elasticsearch
* chown -R elasticsearch:elasticsearch /usr/local/elasticsearch-rtf-5.0
* su elasticsearch
* cd /usr/local/elasticsearch-rtf-5.0
* ./bin/elasticsearch -d

启动完成,可查看集群信息

![es](/assets/images/posts/es_cluster/head.png)

![es](/assets/images/posts/es_cluster/bigdesk.png)

es安装与插件安装参考[Begin ElasticSearch][begin-es]

[begin-es]: /2017/01/17/begin-es-in-chinese
[cnpm]: https://npm.taobao.org/ "CNPM"
[elasticsearch-rtf]: https://github.com/medcl/elasticsearch-rtf "elasticsearch-rtf"
[bigdesk]: https://github.com/hlstudio/bigdesk