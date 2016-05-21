/**
 * convert CnBlog blog to Jekyll post
 */

var fs = require('fs');
var xml2js = require('xml2js');

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
        var postName = format('yyyy-MM-dd-', date) + title +'.md';
        var content = post['description'][0];

        savePost(postName, content)
    }
}


function replaceImages(){


}

function imageDownload(url) {



    // http://images.cnblogs.com/cnblogs_com/talywy/201210/201210092306053064.png
}

function savePost(postName, content) {
    fs.writeFile(postName, '---\nlayout: post\n---\n\n');
    fs.appendFile(postName, content, function () {
        console.log(postName + " is saved...");
    });
}

function main(args){
    if (args != 3) {
        console.log('usage:   node blog_parse {xmlPath}');
    } else {
        xmlPath = [2];
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



