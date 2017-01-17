/**
 * convert CnBlog blog to Jekyll post
 */

var fs = require('fs');
var path = require('path');
var http = require('http');
var xml2js = require('xml2js');
var mkdirp = require('mkdirp');


var xmlPath;


function xmlParseCallback(ex, result) {
    if (ex) {
        throw ex;
    }

    var postItems = result['rss']['channel'][0]['item'];
    var format = require('date-format');
    for (var i = 0, len = postItems.length; i < len; i++) {
        var post = postItems[i];

        var date = new Date(post['pubDate'][0]);
        var title = post['title'][0];
        var postName = format('yyyy-MM-dd-', date) + title + '.md';
        var content = post['description'][0];

        savePost(postName, content)
    }

    console.log("convert complete...");
}


function replaceImagesAndAttach(content) {
    var img = /http:\/\/images\.(cnblogs|cnitblog)\.com\/([^\s]+)\/(\w+.png|jpg|gif|bmp)/ig;
    var attach = /http:\/\/files\.cnblogs\.com\/([^\s]+)\/(\w+.zip|rar|tar|gz)/ig;

    var imgRet;
    while ((imgRet = img.exec(content)) !== null) {
        var imgUrl = imgRet[0];
        var imgPath = "assets/images/posts/" + imgRet[2] + "/" + imgRet[3];

        fileDownload(imgUrl, imgPath);
    }
    content = content.replace(img, '/assets/images/posts/$2/$3');


    var attachRet;
    while ((attachRet = attach.exec(content)) !== null) {
        var attachUrl = attachRet[0];
        var attachPath = "assets/attach/" + attachRet[1] + "/" + attachRet[2];

        fileDownload(attachUrl, attachPath);
    }

    content = content.replace(attach, '/assets/attach/$1/$2');

    return content;
}

function fileDownload(url, file) {
    console.log("download file:" + file + " from:" + url);

    var dir = path.dirname(file);
    if (!fs.existsSync(dir)) {
        mkdirp(dir, function(err){
            console.error(err);
        });
    }

    var createDownload = require('mt-downloader').createDownload
    var downloader = createDownload({path: file, url: url});
    downloader.start().toPromise();

//
//    if(fs.existsSync(file)) {
//        console.warn( file + " is existed, delete it...");
//        fs.unlink(file);
//    }
//
//    var file = fs.createWriteStream(file);
//    var request = http.get(url, function (response) {
//        response.pipe(file);
//    });
}

function savePost(postName, content) {

    try {
        content = replaceImagesAndAttach(content);
        var fileName = "_posts/" + postName;
        fs.writeFile(fileName, '---\nlayout: post\n---\n\n');
        fs.appendFile(fileName, content, function () {
            console.log(postName + " is saved...");
        });
    } catch (e) {
        console.dir(e);
    }
}

function main(args) {
    if (args.length != 3) {
        console.log('usage:   node blog_parse {xmlPath}');
    } else {
        xmlPath = args[2];
        console.log("xmlPath is:" + xmlPath);

        var parser = new xml2js.Parser();
        fs.readFile(xmlPath, function (err, bytesRead) {
            if (err) {
                throw err;
            }

            parser.parseString(bytesRead, xmlParseCallback);
        })
    }
}

main(process.argv);



