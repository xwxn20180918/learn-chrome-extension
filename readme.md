## chrome1入门开发，显示hello world
给manifest.json添加 action 配置default_popup，这样点击icon的时候，会打开一个popup页，并显示hello world
创建一个popup.html，内容为：
``` html
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>显示出hello world</title>
    </head>
    <body>
        <h1>显示出hello world</h1>
    </body>
    </html>
```

### 将 chrome1 安装到谷歌浏览器
安装方式是，直接将chrome1文件夹添加到到谷歌浏览器的扩展程序中，在扩展程序中打开开发者模式，然后加载已解压缩的扩展程序。
![安装完成效果](./images/step1.png)
然后点击一个新的tab页面，点击插件扩展程序按钮
![插件扩展程序按钮](./images/extenision.png)
选择 刚才安装的 hello worrld 插件
![选择插件](./images/hello-world.png)
点击该插件，会打开一个popup页面，显示hello world
![hello world](./images/show-hello-world.png)
至此完成了插件的开发、安装。完整代码在[这里](https://gitee.com/shenshuai89/learn-chrome-extension)
