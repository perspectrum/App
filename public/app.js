// Using IIFE for Implementing Module Pattern to keep the Local Space for the JS Variables
(function () {

    var serverUrl = "/",
        comments = [],
        pusher = new Pusher('7e702683ef693aa93027', {
            cluster: 'us2',
            encrypted: true
        }),
        // Subscribing to the 'flash-comments' Channel
        channel = pusher.subscribe('flash-comments'),
        commentForm = document.getElementById('comment-form'),
        commentsList = document.getElementById('comments-list'),
        commentTemplate = document.getElementById('comment-template'),
        articleTemplate = document.getElementById('article-template'),
        article = document.getElementById('article');


    var getComments = new XMLHttpRequest();
    getComments.onreadystatechange = function () {
        if (getComments.readyState == XMLHttpRequest.DONE) {
            // console.log("!!!!!!!!!");
            var json = JSON.parse(getComments.responseText);
            for (var i in json) {
                console.log(json[i]);
                var newCommentHtml = commentTemplate.innerHTML.replace('{{name}}', json[i].name);
                newCommentHtml = newCommentHtml.replace('{{email}}', json[i].email);
                newCommentHtml = newCommentHtml.replace('{{comment}}', json[i].comment);
                var newCommentNode = document.createElement('div');
                newCommentNode.classList.add('comment');
                newCommentNode.innerHTML = newCommentHtml;
                commentsList.appendChild(newCommentNode);
            }
        }
    };
    getComments.open('GET', '/getComments', true);
    getComments.send(null);

    var getArticle = new XMLHttpRequest();
    getArticle.onreadystatechange = function () {
        if (getArticle.readyState == XMLHttpRequest.DONE) {
            //console.log("!!!!!!!!!");
            var data = JSON.parse(getArticle.responseText);
            json = data[0];
            console.log(json);
            console.log(json.author);
            console.log(json.title);
            console.log(json.url);
            console.log(json.description);

            var newArticleTemplate = articleTemplate.innerHTML.replace('{{author}}', json.author);
            newArticleTemplate = newArticleTemplate.replace('{{title}}', json.title);
            newArticleTemplate = newArticleTemplate.replace('{{url}}', json.url);
            newArticleTemplate = newArticleTemplate.replace('{{imageurl}}', json.urlToImage);
            newArticleTemplate = newArticleTemplate.replace('{{description}}', json.description);
            newArticleTemplate = newArticleTemplate.replace('{{date}}', json.date);


            console.log(newArticleTemplate);

            var newArticleNode = document.createElement('div');
            newArticleNode.classList.add('comment');
            newArticleNode.innerHTML = newArticleTemplate;
            article.appendChild(newArticleNode);
            // for (var i in json) {
            //     console.log(json[i]);
            //     var newCommentHtml = commentTemplate.innerHTML.replace('{{name}}', json[i].name);
            //     newCommentHtml = newCommentHtml.replace('{{email}}', json[i].email);
            //     newCommentHtml = newCommentHtml.replace('{{comment}}', json[i].comment);
            //     var newCommentNode = document.createElement('div');
            //     newCommentNode.classList.add('comment');
            //     newCommentNode.innerHTML = newCommentHtml;
            //     commentsList.appendChild(newCommentNode);
            // }
        }
    };
    getArticle.open('GET', '/getArticle', true);
    getArticle.send(null);

    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = true;



    // Binding to Pusher Event on our 'flash-comments' Channel
    channel.bind('new_comment', newCommentReceived);

    // Adding to Comment Form Submit Event
    commentForm.addEventListener("submit", addNewComment);

    // New Comment Receive Event Handler
    // We will take the Comment Template, replace placeholders & append to commentsList
    function newCommentReceived(data) {
        var newCommentHtml = commentTemplate.innerHTML.replace('{{name}}', data.name);
        newCommentHtml = newCommentHtml.replace('{{email}}', data.email);
        newCommentHtml = newCommentHtml.replace('{{comment}}', data.comment);
        var newCommentNode = document.createElement('div');
        newCommentNode.classList.add('comment');
        newCommentNode.innerHTML = newCommentHtml;
        commentsList.appendChild(newCommentNode);
    }

    function addNewComment(event) {
        event.preventDefault();
        var newComment = {
            "name": document.getElementById('new_comment_name').value,
            "email": document.getElementById('new_comment_email').value,
            "comment": document.getElementById('new_comment_text').value
        };

        var xhr = new XMLHttpRequest();
        xhr.open("POST", serverUrl + "comment", true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onreadystatechange = function () {
            if (xhr.readyState != 4 || xhr.status != 200) return;

            // On Success of creating a new Comment
            console.log("Success: " + xhr.responseText);
            commentForm.reset();
        };
        xhr.send(JSON.stringify(newComment));
    }

})();