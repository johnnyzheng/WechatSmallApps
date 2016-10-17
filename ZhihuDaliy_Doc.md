# 微信小程序之知乎日报

上一次的《微信小程序之小豆瓣图书》制作了一个图书的查询功能，只是简单地应用到了网络请求，其他大多数小程序应有的知识。而本次的示例是`知乎日报`，功能点比较多，页面也比上次复杂了许多。在我编写这个DEMO之前，网上已经有很多网友弄出了相同的DEMO，也是非常不错的，毕竟这个案例很经典，有比较完整的API，很值得模仿学习。本次个人的DEMO也算是一次小小的练习吧。

由于知乎日报是一个资讯类的App，UI的布局主要是以资讯列表页、资讯详情页和评论页为主，当然本次也附带了应用设置页，不过现阶段功能尚未编写，过段时间会更新补充，继续完善。

## API分析

本次应用使用了知乎日报的API，相比上次豆瓣图书的数量比较多了，但是部分仍然有限制，而且自己没有找到评论接口的分页参数，所以评论这块没有做数据的分页。

以下是使用到的具体API，更加详细参数和返回结构可参照网上网友分享的 [知乎日报-API-分析](https://github.com/izzyleung/ZhihuDailyPurify/wiki/知乎日报-API-分析) ，在此就不做再次分析了。

### 启动界面图片

`http://news-at.zhihu.com/api/4/start-image/{size}`

参数 | 说明
---|---
size | 图片尺寸，格式：宽\*高。例如: 768\*1024

获取刚进入应用时的显示封面，可以根据传递的尺寸参数来获取适配用户屏幕的封面。

### 获取最新日报

`http://news-at.zhihu.com/api/4/news/latest`

返回的数据用于日报的首页列表，首页的结构有上下部分，上部分是图片滑动模块，用于展示热门日报，下部分是首页日报列表，以上接口返回的数据有热门日报和首页日报

### 获取日报详细

`http://news-at.zhihu.com/api/4/news/{id}`

参数 | 说明
---|---
id | 日报id

在点击日报列表也的日报项时，需要跳转到日报详情页展示日报的具体信息，这个接口用来获取日报的展示封面和具体内容。

### 历史日报

`http://news.at.zhihu.com/api/4/news/before/{date}`

参数 | 说明
---|---
date | 年月日格式时间yyyyMMdd,例如：20150903、20161202

这个接口也是用与首页列表的日报展示，但是不同的是此接口需要传一个日期参数，如`20150804`格式。获取最新日报接口只能获取当天的日报列表，如果需要获取前天或者更久之前的日报，则需要这个接口单独获取。

### 日报额外信息

`http://news-at.zhihu.com/api/4/story-extra/{id}`

参数 | 说明
---|---
id | 日报id

在日报详情页面中，不仅要展示日报的内容，好需要额外获取此日报的评论数目和推荐人数等额外信息。

### 日报长评

`http://news-at.zhihu.com/api/4/story/{id}/long-comments`

参数 | 说明
---|---
id | 日报id

日报的评论页面展示长评用到的接口（没有找到分页参数，分页没有做）

### 日报短评

`http://news-at.zhihu.com/api/4/story/{id}/short-comments`

参数 | 说明
---|---
id | 日报id

日报的评论页面展示段评用到的接口（没有找到分页参数，分页没有做）

### 主题日报栏目列表

`http://news-at.zhihu.com/api/4/themes`

主页的侧边栏显示有主题日报的列表，需要通过这个接口获取主题日报栏目列表

### 主题日报具体内容列表

`http://news-at.zhihu.com/api/4/theme/{themeId}`

参数 | 说明
---|---
themeId | 主题日报栏目id

在主页侧栏点击主题日报进入主题日报的内容页，需要展示此主题日报下的日报列表。

## 代码编写

### 启动页

作为一个仿制知乎日报的伪APP，高大上的启动封面是必须的，哈哈。启动页面很简单，请求一个应用启动封面接口，获取封面路径和版权信息。当进入页面，在`onLoad`事件中获取屏幕的宽和高来请求适合尺寸的图片，在`onReady`中请求加载图片，在请求成果之后，延迟2s进入首页，防止页面一闪而过。

```javascript
onLoad: function( options ) {
    var _this = this;
    wx.getSystemInfo( {
      success: function( res ) {
        _this.setData( {
          screenHeight: res.windowHeight,
          screenWidth: res.windowWidth,
        });
      }
    });
},

onReady: function() {
    var _this = this;
    var size = this.data.screenWidth + '*' + this.data.screenHeight;
    requests.getSplashCover( size, ( data ) => {
      _this.setData( { splash: data });
    }, null, () => {
      toIndexPage.call(_this);
    });
}
  
/**
 * 跳转到首页
 */
function toIndexPage() {
  setTimeout( function() {
    wx.redirectTo( {
      url: '../index/index'
    });
  }, 2000 );
}
```
![Splash启动页面](http://oeiyvmnx5.bkt.clouddn.com/zhihuribao_splash.png)

### 首页

#### 轮播图

首页顶部需要用到轮播图来展示热门日报，小程序中的`Swipe`组件可以实现。

```xml
<swiper class="index-swiper" indicator-dots="true" interval="10000">
    <block wx:for="{{sliderData}}">
        <swiper-item data-id="{{item.id}}" bindtap="toDetailPage">
            <image mode="aspectFill" src="{{item.image}}" style="width:100%" />
            <view class="mask"></view>
            <view class="desc"><text>{{item.title}}</text></view>
        </swiper-item>
    </block>
</swiper>
```
所有的内容都必须要在`swiper-item`标签中，因为我们的图片不止有一张，而是有多个热门日报信息，需要用循环来展示数据。这里需要指定的是`image`里的属性`mode`设置为`aspectFill`是为了适应组件的宽度，这需要牺牲他的高度，即有可能裁剪，但这是最好的展示效果。`toDetailPage`是点击事件，触发跳转到日报详情页。在跳转到日报详情页需要附带日报的`id`过去，我们在循环列表的时候把当前日报的`id`存到标签的`data`中，用`data-id`标识，这有点类似与html5中的`data-*`API。当在这个标签上发生点击事件的时候，我们可以通过`Event.currentTarget.dataset.id`来获取`data-id`的值。

![首页](http://oeiyvmnx5.bkt.clouddn.com/zhihuribao_index.png)

#### 日报列表

列表的布局大同小异，不过这里的列表涉及到分页，我们可以毫不犹豫地使用`scroll-view`组件，它的`scrolltolower`是非常好用的，当组件滚动到底部就会触发这个事件。上次的小豆瓣图书也是使用了这个组件分页。不过这次的分页动画跟上次不一样，而是用一个附带旋转动画的刷新图标，使用官方的动画api来实现旋转。

```xml
<view class="refresh-block" wx:if="{{loadingMore}}">
    <image animation="{{refreshAnimation}}" src="../../images/refresh.png"></image>
</view>
```
代码中有一个显眼的`animation`属性，这个属性就是用来控制动画的。

```js
/**
 * 旋转上拉加载图标
 */
function updateRefreshIcon() {
  var deg = 360;
  var _this = this;

  var animation = wx.createAnimation( {
    duration: 1000
  });

  var timer = setInterval( function() {
    if( !_this.data.loadingMore )
      clearInterval( timer );
    animation.rotateZ( deg ).step();
    deg += 360;
    _this.setData( {
      refreshAnimation: animation.export()
    })
  }, 1000 );
}
```
当列表加载数据时，给动画设置一个时长`duration`，然后按Z轴旋转，即垂直方向旋转`rotateZ`，每次旋转360度，周期是1000毫秒。

列表的布局跟上次的小豆瓣图书的结构差不多，用到了循环结构`wx:for`和判断语句`wx:if`、 `wx:else`来控制不同的展示方向。
```xml
<view class="common-list">
    <block wx:for="{{pageData}}">
        <view class="list-item {{item.images[0] ? 'has-img': ''}}" wx:if="{{item.type != 3}}" data-id="{{item.id}}" bindtap="toDetailPage">
            <view class="content">
                <text>{{item.title}}</text>
            </view>
            <image wx:if="{{item.images[0]}}" src="{{item.images[0]}}" class="cover"></image>
        </view>
        <view class="list-spliter" wx:else>
            <text>{{item.title}}</text>
        </view>
    </block>
</view>
```
`class="list-spliter"`这块是用来显示日期，列表中的日报只要不是同一天的记录，就在中间插入一条日期显示块。在列表项中有一个三元运算判断输出具体的class`{{item.images[0] ? 'has-img': ''}}`，是因为列表中可能没有图片，因此需要判定当前有没有图片，没有图片就不添加class为`has-img`来控制带有图片列表项的布局。

#### 浮动按钮

因为小程序中没有侧栏组件，无法做到侧滑手势显示侧栏（本人发现touchstart事件和tap事件有冲突，无法实现出手势侧滑判断，所以没有用侧滑手势，可能是本人理解太浅了，没有发现解决方法，嘿嘿...），浮动按钮的样式参照了Android中的FloatAction经典按钮。可以浮动在界面上，还可以滑动到任意位置，背景为稍微透明。

```xml
<view class="float-action" bindtap="ballClickEvent" style="opacity: {{ballOpacity}};bottom:{{ballBottom}}px;right:{{ballRight}}px;" bindtouchmove="ballMoveEvent"> 
</view>
```

```css
.float-action {
  position: absolute;
  bottom: 20px;
  right: 30px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  box-shadow: 2px 2px 10px #AAA;
  background: #1891D4;
  z-index: 100;
}
```
按钮的样式随便弄了一下，宽高用了`px`是因为后面的移动判断需要获取屏幕的宽高信息，这些信息的单位是`px`。wxml绑定了点击事件和移动事件，点击事件是控制侧栏弹出，滑动事件是按钮移动。

```javascript
//浮动球移动事件
ballMoveEvent: function( e ) {
    var touchs = e.touches[ 0 ];
    var pageX = touchs.pageX;
    var pageY = touchs.pageY;
    if( pageX < 25 ) return;
    if( pageX > this.data.screenWidth - 25 ) return;
    if( this.data.screenHeight - pageY <= 25 ) return;
    if( pageY <= 25 ) return;
    var x = this.data.screenWidth - pageX - 25;
    var y = this.data.screenHeight - pageY - 25;
    this.setData( {
        ballBottom: y,
        ballRight: x
    });
}
```
`touchmove`事件中的会传递一个`event`参数，通过这个参数可以获取到当前手势滑动到的具体坐标信息`e.touches[ 0 ]`

#### 侧滑菜单

侧滑菜单是一个经典APP布局方案，小程序中没有提供这个组件，甚是遗憾。不过实现起来也不是很难，但是总感觉有点别扭...

侧滑菜单的样式采用了固定定位的布局`position: fixed`，默认隐藏与左侧，当点击浮动按钮时弹出，点击遮罩或者侧栏上边的关闭按钮时收回。侧栏的弹出和收回动画采用小程序提供的动画API。

```xml
<view class="slide-mask" style="display:{{maskDisplay}}" bindtap="slideCloseEvent"></view>
<view class="slide-menu" style="right: {{slideRight}}px;width: {{slideWidth}}px;height:{{slideHeight}}px;" animation="{{slideAnimation}}">
  <icon type="cancel" size="30" class="close-btn" color="#FFF" bindtap="slideCloseEvent" />
  <scroll-view scroll-y="true" style="height:100%;width:100%">
    <view class="header">
      <view class="userinfo">
        <image src="../../images/avatar.png" class="avatar"></image>
        <text>Oopsguy</text>
      </view>
      <view class="toolbar">
        <view class="item">
          <image src="../../images/fav.png"></image>
          <text>收藏</text>
        </view>
        <view class="item" bindtap="toSettingPage">
          <image src="../../images/setting.png"></image>
          <text>设置</text>
        </view>
      </view>
    </view>
    <view class="menu-item home">
      <text>首页</text>
    </view>
    <view class="slide-inner">
      <block wx:for="{{themeData}}">
        <view class="menu-item" data-id="{{item.id}}" bindtap="toThemePage">
          <text>{{item.name}}</text>
          <image src="../../images/plus.png"></image>
        </view>
      </block>
    </view>    
  </scroll-view>
</view>
```

```css
/*slide-menu*/
.slide-mask {
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  bottom: 0;
  background: rgba(0, 0, 0, .3);
  z-index: 800;
}
.slide-menu {
  position: fixed;
  top: 0;
  background: #FFF;
  z-index: 900;
}
/*.slide-menu .slide-inner {
  padding: 40rpx;
}*/
.slide-menu .header {
  background: #019DD6;
  height: 200rpx;
  color: #FFF;
  padding: 20rpx 40rpx 0 40rpx;
}

.userinfo {
  height: 80rpx;
  line-height: 80rpx;
  overflow: hidden;
}
.userinfo .avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 40rpx;
  float: left;
}
.userinfo text {
  float: left;
  font-size: 35rpx;
}
.toolbar {
  height: 100rpx;
  padding-top: 25rpx;
  line-height: 75rpx;
}
.toolbar .item {
  width: 50%;
  display: inline-block;
  overflow: hidden;
  text-align: center
}
.toolbar .item text {
  display: inline-block;
  font-size: 30rpx
}
.toolbar .item image {
  display: inline-block;
  position: relative;
  top: 10rpx;
  margin-right: 10rpx;
  height: 50rpx;
  width: 50rpx;
}

.slide-menu .menu-item {
  position: relative;
  height: 100rpx;
  line-height: 100rpx;
  padding: 0 40rpx;
  font-size: 35rpx;
}
.slide-menu .menu-item:active {
  background: #FAFAFA;
}
.slide-menu .menu-item image {
  position: absolute;
  top: 25rpx;
  right: 40rpx;
  width: 50rpx;
  height: 50rpx;
}
.slide-menu .home {
  color: #019DD6
}

.slide-menu .close-btn {
  position: absolute;
  top: 20rpx;
  right: 40rpx;
  z-index: 1000
}
```

以上是侧栏的一个简单的布局和样式，包含了侧栏中的用户信息块和主题日报列表。当然这些信息是需要通过js的中网络请求来获取的。侧栏结构上边有一个class为`slide-mask`的view，这是一个遮罩元素，当侧栏弹出的时候，侧栏后边就有一层轻微透明的黑色遮罩。侧栏的高度和宽度初始是不定的，需要在进入页面的时候，马上获取设备信息来获取屏幕的高度宽度调整侧栏样式。

```javascript
//获取设备信息，屏幕的高度宽度
onLoad: function() {
    var _this = this;
    wx.getSystemInfo( {
      success: function( res ) {
        _this.setData( {
          screenHeight: res.windowHeight,
          screenWidth: res.windowWidth,
          slideHeight: res.windowHeight,
          slideRight: res.windowWidth,
          slideWidth: res.windowWidth * 0.7
        });
      }
    });
}
```
宽度我取了屏幕宽度的70%，高度一致。侧栏的弹出收回动画使用内置动画API

```javascript
//侧栏展开
function slideUp() {
  var animation = wx.createAnimation( {
    duration: 600
  });
  this.setData( { maskDisplay: 'block' });
  animation.translateX( '100%' ).step();
  this.setData( {
    slideAnimation: animation.export()
  });
}

//侧栏关闭
function slideDown() {
  var animation = wx.createAnimation( {
    duration: 800
  });
  animation.translateX( '-100%' ).step();
  this.setData( {
    slideAnimation: animation.export()
  });
  this.setData( { maskDisplay: 'none' });
}
```
侧栏弹出的时候，遮罩的css属性`display`设置为`block`显示，侧栏通过css动画`transform`来想右侧移动了100%的宽度`translateX(100%)`，侧栏收回时，动画恰好与弹出的相反，其实这些动画最后都会翻译为css3动画属性，这些API只是css3动画的封装。为了点击遮罩收回侧栏，遮罩的`tap`事件也要绑定`slideCloseEvent`

```javascript
//浮动球点击 侧栏展开
ballClickEvent: function() {
    slideUp.call( this );
},

//遮罩点击  侧栏关闭
slideCloseEvent: function() {
    slideDown.call( this );
}
```
![侧栏菜单](http://oeiyvmnx5.bkt.clouddn.com/zhihuribao_slide.png)

### 日报详情页

#### 内容

日报的内容也是最难做的，因为接口返回的内容是html...，天呀，是html！小程序肯本就不支持，解析html的过程非常痛苦，因为本人的正则表达式只是几乎为0，解析方案的寻找过程很虐心，经典的jQuery是用不了了，又没有`dom`，无法用传统的方式解析html。尝试了正则学习，但是也是无法在短时间内掌握，寻找了很多解析库，大多是依赖浏览器api。不过，上天是不会忽视有心人的，哈哈，还是被我找到了解决方案。幸运的我发现了一个用正则编写的和类似与语法分析方法的xml解析库。这个库是一个very good的网友封装的html解析库。详情点击 [用Javascript解析html](http://pickerel.iteye.com/blog/264252)。

由于日报详情内容的html部分结构太大，这里只列出了简要的结构，这个结构是通用的（不过不保证知乎会变动结构，要是变动了，之前的解析可能就没用了...心累）

```html
<div class="question">
    <h2 class="question-title">日本的六大财阀现在怎么样了？</h2>
    <div class="answer">
        <div class="meta">
            <img class="avatar" src="http://pic1.zhimg.com/e53a7f35d5b1e27b00aa90a2c1468a8c_is.jpg">
            <span class="author">leon，</span><span class="bio">data analyst</span>
        </div>
        <div class="content">
            <p>&ldquo;财阀&rdquo;在战后统称为 Group（集团），是以银行和传统工业企业为核心的松散集合体，由于历史渊源而有相互持股。</p>
            <p>Group 对于当今日本企业的意义在于：</p>
            <p><strong>MUFG：三菱集团、三和集团（みどり会）</strong></p>
            <p><img class="content-image" src="http://pic1.zhimg.com/70/90c319ac7a7b2723e5b511de954f45bc_b.jpg" alt=""
                /></p>
        </div>
    </div>
    <div class="view-more"><a href="http://www.zhihu.com/question/23907827">查看知乎讨论<span class="js-question-holder"></span></a></div>
</div>
```
外层的`.question`是日报中问题答案的显示单位，可能有多个，因此需要循环显示。`.question-title`是问题的标题，`.meta`中是作者的信息，`img.avatar`是用户的头像,`span.author`是用户的名称，`span.bio`可能使用户的签名吧。最难解析的是`.content`中的内容，比较多。但是有个规律就是都是以`<p>`标签包裹着，获取了`.content`中的所有`p`就可以得到所有的段落。之后再解析出段落中的图片。

以下是详情页的内容展示模版

```xml
<view style="padding-bottom: 150rpx;">
    <block wx:for="{{news.body}}">
        <view class="article">
            <view class="title" wx:if="{{item.title && item.title != ''}}">
                <text>{{item.title}}</text>
            </view>
            <view class="author-info" wx:if="{{(item.avatar && item.avatar != '') || (item.author && item.author != '') || (item.bio && item.bio != '')}}">
                <image wx:if="{{item.avatar && item.avatar != ''}}" class="avatar" src="{{item.avatar}}"></image>
                <text wx:if="{{item.author && item.author != ''}}" class="author-name">{{item.author}}</text>
                <text wx:if="{{item.bio && item.bio != ''}}" class="author-mark">，{{item.bio}}</text>
            </view>
            <view class="content" wx:if="{{item.content && item.content.length > 0}}">
                <block wx:for="{{item.content}}" wx:for-item="it">
                    <block wx:if="{{it.type == 'p'}}">
                        <text>{{it.value}}</text>
                    </block>
                    <block wx:elif="{{it.type == 'img'}}">
                        <image mode="aspectFill" src="{{it.value}}" data-src="{{it.value}}" bindtap="previewImgEvent" />
                    </block>
                    <block wx:elif="{{it.type == 'pstrong'}}">
                        <text class="strong">{{it.value}}</text>
                    </block>
                    <block wx:elif="{{it.type == 'pem'}}">
                        <text class="em">{{it.value}}</text>
                    </block>
                    <block wx:elif="{{it.type == 'blockquote'}}">
                        <text class="qoute">{{it.value}}</text>
                    </block>
                    <block wx:else>
                        <text>{{it.value}}</text>
                    </block>
                </block>
                
            </view>

            <view  class="discuss" wx:if="{{item.more && item.more != ''}}">
                <navigator url="{{item.more}}">查看知乎讨论</navigator>
            </view>
        </view>
    </block>
</view>
```
可以看出模版中的内容展示部分用了蛮多的block加判断语句`wx:if  wx:elif  wx:else`。这些都是为了需要根据解析后的内容类型来判断需要展示什么标签和样式。解析后的内容大概格式是这样的：

```json
{
    body: [
       title: '标题',
       author: '作者', 
       bio: '签名', 
       avatar: '头像', 
       more: '更多地址',
       content: [   //内容
            {
                type: 'p',
                value: '普通段落内容'
            },
            {
                type: 'img',
                value: 'http://xxx.xx.xx/1.jpg'
            },
            {
                type: 'pem',
                value: '...'
            },
            ...
       ]
    ],
    ...
}
```
需要注意的一点是主题日报有时候返回的html内容是经过unicode编码的不能直接显示，里边全是类似`&#xxxx;`的字符，这需要单独为主题日报的日报详情解析编码。

再点击主题日报中的列表项是，传递一个标记是主题日报的参数`theme`

```javascript
//跳转到日报详情页
toDetailPage: function( e ) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo( {
      url: '../detail/detail?theme=1&id=' + id
    });
},    
```

然后在Detail.js的`onLoad`事件中接受参数

```javascript
//获取列表残过来的参数 id：日报id， theme：是否是主题日报内容（因为主题日报的内容有些需要单独解析）
onLoad: function( options ) {
    var id = options.id;
    var isTheme = options[ 'theme' ];
    this.setData( { id: id, isTheme: isTheme });
},
```

之后开始请求接口获取日报详情，并根据是否是主题日报进行个性化解析

```javascript
//加载页面相关数据
function loadData() {
  var _this = this;
  var id = this.data.id;
  var isTheme = this.data.isTheme;
  //获取日报详情内容
  _this.setData( { loading: true });
  requests.getNewsDetail( id, ( data ) => {
    data.body = utils.parseStory( data.body, isTheme );
    _this.setData( { news: data, pageShow: 'block' });
    wx.setNavigationBarTitle( { title: data.title }); //设置标题
  }, null, () => {
    _this.setData( { loading: false });
  });
}
```
以上传入一个`isTheme`参数进入解析方法，解析方法根据此参数判断是否需要进行单独的编码解析。

内容解析的库代码比较多，就不贴出了，可以到git上查看。这里给出解析的封装。

```javascript
var HtmlParser = require( 'htmlParseUtil.js' );

String.prototype.trim = function() {
  return this.replace( /(^\s*)|(\s*$)/g, '' );
}

String.prototype.isEmpty = function() {
  return this.trim() == '';
}

/**
 * 快捷方法 获取HtmlParser对象
 * @param {string} html html文本
 * @return {object} HtmlParser
 */
function $( html ) {
  return new HtmlParser( html );
}

/**
 * 解析story对象的body部分
 * @param {string} html body的html文本
 * @param {boolean} isDecode 是否需要unicode解析
 * @return {object} 解析后的对象
 */
function parseStory( html, isDecode ) {
  var questionArr = $( html ).tag( 'div' ).attr( 'class', 'question' ).match();
  var stories = [];
  var $story;
  if( questionArr ) {
    for( var i = 0, len = questionArr.length;i < len;i++ ) {
      $story = $( questionArr[ i ] );
      stories.push( {
        title: getArrayContent( $story.tag( 'h2' ).attr( 'class', 'question-title' ).match() ),
        avatar: getArrayContent( getArrayContent( $story.tag( 'div' ).attr( 'class', 'meta' ).match() ).jhe_ma( 'img', 'src' ) ),
        author: getArrayContent( $story.tag( 'span' ).attr( 'class', 'author' ).match() ),
        bio: getArrayContent( $story.tag( 'span' ).attr( 'class', 'bio' ).match() ),
        content: parseStoryContent( $story, isDecode ),
        more: getArrayContent( getArrayContent( $( html ).tag( 'div' ).attr( 'class', 'view-more' ).match() ).jhe_ma( 'a', 'href' ) )
      });
    }
  }
  return stories;
}

/**
 * 解析文章内容
 * @param {string} $story htmlparser对象
 * @param {boolean} isDecode 是否需要unicode解析
 * @returb {object} 文章内容对象
 */
function parseStoryContent( $story, isDecode ) {
  var content = [];
  var ps = $story.tag( 'p' ).match();
  var p, strong, img, blockquote, em;
  if( ps ) {
    for( var i = 0, len = ps.length;i < len;i++ ) {
      p = ps[ i ]; //获取<p>的内容
      if( !p || p.isEmpty() )
        continue;

      img = getArrayContent(( p.jhe_ma( 'img', 'src' ) ) );
      strong = getArrayContent( p.jhe_om( 'strong' ) );
      em = getArrayContent( p.jhe_om( 'em' ) );
      blockquote = getArrayContent( p.jhe_om( 'blockquote' ) );

      if( !img.isEmpty() ) { //获取图片
        content.push( { type: 'img', value: img });
      }
      else if( isOnly( p, strong ) ) { //获取加粗段落<p><strong>...</strong></p>
        strong = decodeHtml( strong, isDecode );
        if( !strong.isEmpty() )
          content.push( { type: 'pstrong', value: strong });
      }
      else if( isOnly( p, em ) ) { //获取强调段落 <p><em>...</em></p>
        em = decodeHtml( em, isDecode );
        if( !em.isEmpty() )
          content.push( { type: 'pem', value: em });
      }
      else if( isOnly( p, blockquote ) ) { //获取引用块 <p><blockquote>...</blockquote></p>
        blockquote = decodeHtml( blockquote, isDecode );
        if( !blockquote.isEmpty() )
          content.push( { type: 'blockquote', value: blockquote });
      }
      else { //其他类型 归类为普通段落 ....太累了 不想解析了T_T
        p = decodeHtml( p, isDecode );
        if( !p.isEmpty() )
          content.push( { type: 'p', value: p });
      }
    }
  }
  return content;
}

/**
 * 取出多余或者难以解析的html并且替换转义符号
 */
function decodeHtml( value, isDecode ) {
  if( !value ) return '';
  value = value.replace( /<[^>]+>/g, '' )
    .replace( /&nbsp;/g, ' ' )
    .replace( /&ldquo;/g, '"' )
    .replace( /&rdquo;/g, '"' ).replace( /&middot;/g, '·' );
  if( isDecode )
    return decodeUnicode( value.replace( /&#/g, '\\u' ) );
  return value;

}

/**
 * 解析段落的unicode字符，主题日报中的内容又很多是编码过的
 */
function decodeUnicode( str ) {
  var ret = '';
  var splits = str.split( ';' );
  for( let i = 0;i < splits.length;i++ ) {
    ret += spliteDecode( splits[ i ] );
  }
  return ret;
};

/**
 * 解析单个unidecode字符
 */
function spliteDecode( value ) {
  var target = value.match( /\\u\d+/g );
  if( target && target.length > 0 ) { //解析类似  "7.1 \u20998" 参杂其他字符
    target = target[ 0 ];
    var temp = value.replace( target, '{{@}}' );
    target = target.replace( '\\u', '' );
    target = String.fromCharCode( parseInt( target ) );
    return temp.replace( "{{@}}", target );
  } else {
    // value = value.replace( '\\u', '' );
    // return String.fromCharCode( parseInt( value, '10' ) )
    return value;
  }
}

/**
 * 获取数组中的内容（一般为第一个元素）
 * @param {array} arr 内容数组
 * @return {string} 内容
 */
function getArrayContent( arr ) {
  if( !arr || arr.length == 0 ) return '';
  return arr[ 0 ];
}

function isOnly( src, target ) {
  return src.trim() == target;
}

module.exports = {
  parseStory: parseStory
}

```

代码的解析过程比较繁杂，大家可以根据返回的html结构和参照解析库的作者写的文章来解读。

![详细页面1](http://oeiyvmnx5.bkt.clouddn.com/zhihuribao_detail.png)

![详细页面2](http://oeiyvmnx5.bkt.clouddn.com/zhihuribao_detail2.png)

#### 底部工具栏

一般资讯APP的详情页都有一个底部的工具栏用于操作分享、收藏、评论和点赞等等。为了更好地锻炼动手能力，自己也做了一个底部工具栏，虽然官方的APP并没有这个东西。前面介绍到的获取额外信息API在这里就被使用了。本来自己是想把推荐人数和评论数显示在底部的图片右上角，但是由于本人的设计问题，底部的字号已经是很小了，显示数量的地方的字号又不能再小了，这样看起来数字显示的地方和图标的大小几乎一样，很是别扭，所以就不现实数字了。这块还是有很多待完善的功能的，比较收藏功能和是否有评论提示功能等。

```xml
<view class="toolbar">
    <view class="inner">
        <view class="item" bindtap="showModalEvent"><image src="../../images/share.png" /></view>
        <view class="item" bindtap="reloadEvent"><image src="../../images/refresh.png" /></view>
        <view class="item"><image src="../../images/favorite.png" /></view>
        <view class="item" data-id="{{id}}" bindtap="toCommentPage"><image src="../../images/insert_comment.png" />
            <view class="tip"></view>
        </view>
        <view class="item">
            <image src="../../images/thumb_up_active.png" />
        </view>
    </view>
</view>
```

底部有分享、收藏、评论和点赞按钮，分享肯定是做不了啦，哈哈，但是效果还是需要有的，就一个modal弹窗，显示各类社交应用的图标就行啦。

```xml
<modal class="modal" confirm-text="取消" no-cancel hidden="{{modalHidden}}" bindconfirm="hideModalEvent">
    <view class="share-list">
        <view class="item"><image src="../../images/share_qq.png" /></view>
        <view class="item"><image src="../../images/share_pengyouquan.png" /></view>
        <view class="item"><image src="../../images/share_qzone.png" /></view>
    </view>
    <view class="share-list" style="margin-top: 20rpx">
        <view class="item"><image src="../../images/share_weibo.png" /></view>
        <view class="item"><image src="../../images/share_alipay.png" /></view>
        <view class="item"><image src="../../images/share_plus.png" /></view>
    </view>
</modal>
```

`model`的隐藏和显示都是通过`hidden`属性来控制。

底部工具栏中还有一个按钮是刷新，其实就是一个重新调用接口请求数据的过程而已。

```javascript
//重新加载数据
reloadEvent: function() {
    loadData.call( this );
},
```
![内容分享](http://oeiyvmnx5.bkt.clouddn.com/zhihuribao_share.png)

### 评论页面

评论页面蛮简单的，就是展示评论列表，但是要展示两部分，一部分是长评，另一部分是短评。长评跟短评的布局都是通用的。进入到评论页面时，如果长评有数据，则先加载长评，短评需要用户点击短评标题才加载，否则就直接加载短评。这需要上一个详情页面中传递日报的额外信息过来（即长评数量和短评数量）。

之前已经在日报详情页面中，顺便加载了额外的信息

```javascript
//请求日报额外信息（主要是评论数和推荐人数）
requests.getStoryExtraInfo( id, ( data ) => {
    _this.setData( { extraInfo: data });
});
```
在跳转到评论页面的时候顺便传递评论数量，这样我们就不用在评论页面在请求一次额外信息了。

```javascript
//跳转到评论页面
toCommentPage: function( e ) {
    var storyId = e.currentTarget.dataset.id;
    var longCommentCount = this.data.extraInfo ? this.data.extraInfo.long_comments : 0; //长评数目
    var shortCommentCount = this.data.extraInfo ? this.data.extraInfo.short_comments : 0; //短评数目
    //跳转到评论页面，并传递评论数目信息
    wx.navigateTo( {
      url: '../comment/comment?lcount=' + longCommentCount + '&scount=' + shortCommentCount + '&id=' + storyId
    });
}
```

评论页面接受参数

```javascript
//获取传递过来的日报id 和 评论数目
onLoad: function( options ) {
    var storyId = options[ 'id' ];
    var longCommentCount = parseInt( options[ 'lcount' ] );
    var shortCommentCount = parseInt( options[ 'scount' ] );
    this.setData( { storyId: storyId, longCommentCount: longCommentCount, shortCommentCount: shortCommentCount });
},
```
进入页面立刻加载数据

```javascript
//加载长评列表
onReady: function() {
    var storyId = this.data.storyId;
    var _this = this;
    this.setData( { loading: true, toastHidden: true });
    
    //如果长评数量大于0，则加载长评，否则加载短评
    if( this.data.longCommentCount > 0 ) {
      requests.getStoryLongComments( storyId, ( data ) => {
        console.log( data );
        _this.setData( { longCommentData: data.comments });
      }, () => {
        _this.setData( { toastHidden: false, toastMsg: '请求失败' });
      }, () => {
        _this.setData( { loading: false });
      });
    } else {
      loadShortComments.call( this );
    }
}


/**
 * 加载短评列表
 */
function loadShortComments() {
  var storyId = this.data.storyId;
  var _this = this;
  this.setData( { loading: true, toastHidden: true });
  requests.getStoryShortComments( storyId, ( data ) => {
    _this.setData( { shortCommentData: data.comments });
  }, () => {
    _this.setData( { toastHidden: false, toastMsg: '请求失败' });
  }, () => {
    _this.setData( { loading: false });
  });
}
```

评论页面的展示也是非常的简单，一下给出长评模版，短评也是一样的，里面的点赞按钮功能木有实现哦。

```xml
<view class="headline">
    <text>{{longCommentCount}}条长评</text>
</view>

<view class="common-list">
    <block wx:for="{{longCommentData}}">
        <view class="list-item has-img" data-id="{{item.id}}">
            <view class="content">
                <view class="header">
                    <text class="title">{{item.author}}</text>
                    <image class="vote" src="../../images/thumb_up.png" />
                </view>
                <text class="body">{{item.content}}</text>
                <text class="bottom">{{item.time}}</text>
            </view>
            <image src="{{item.avatar}}" class="cover" />
        </view>  
    </block>
</view>
```
![评论页面](http://oeiyvmnx5.bkt.clouddn.com/zhihuribao_comment.png)

### 主题日报

主题日报的样式跟首页几乎一模一样，我是拷贝过来修改了一点点（懒）。区别在多了一行主编区域。不过这个主编区域没有实现什么功能，本来是点击主编的头像跳转到主编的个人首页简介，没有时间安排就不做了，这也是需要解析html的（累）。

主题日报列表需要接受一个具体的主题日报id，根据这个id来请求接口获取主题日报的日报列表。

```javascript
//接受主页传递过来的主题日报id
onLoad: function( options ) {
    this.setData( { id: options.themeId });
}
```

主题日报的请求列表方式和主页的列表方式差不多，由于没有发现分页参数，主题日报的日报列表这部分也没有分页请求。主题日报的日报详情还是跳转到日报详情页面的。

![主题日报](http://oeiyvmnx5.bkt.clouddn.com/zhihuribao_theme.png)

### 设置页面

本来想做设置页面里列出的功能，但是工作比较忙，还是归入到后边的完善计划吧，现阶段只做了简单的页面布局。

但是还是讲一下自己的思路
- 夜间模式就是改变应用的显示样式，利用到了css，我们可以在page中放置一个顶层的view来包括起所有的wxml元素，当切换主题时给页面顶层元素一个主题控制类。

```xml
<view class="light">
    ....
</view>

<view class="night">
    ...
</view>
```
> 那怎么实现换肤立即生效呢？一个页面刚启动是会经过`onLoad、onShow`等，当第二次进来的时候页面的`onLoad`事件就不会在次触发，而是触发`onShow`事件，我们可以通过`onShow`事件来获取存在全局缓存中的主题设置。

```javascript

onShow: function() {
    var app = getApp();
    this.setData({theme: app.globalData.theme});
}

```
```xml
<view class="{{theme}}">
    ...
</view>
```

- 清除缓存功能，当然是把临时文件和localStorage中的数据清空。

```javascript
clearDataEvent: function() {
    wx.clearStorage(); //清除应用数据
}
```
- 应用的无图浏览模式跟主题的思路差不多，就是判断应用缓存中的设置是否是无图模式，如果是就在内容显示的时候加一个判断，根据这个值来判断是否显示图片类型的内容。

```javascript
onLoad: function() {
    var app = getApp();
    this.setData({imageMode: app.getImageMode()});
}
```
```xml
<view>
    <image wx:if="{{imageMode}}" src="..." />
    <!--或者-->
    <block wx:if="{{imageMode}}">
        <image src="..." />
    </block>
</view>
```

![设置页面](http://oeiyvmnx5.bkt.clouddn.com/zhihuribao_setting.png)

## 总结

### 问题

- 蛮多图片显示不出来，不知到是为什么，src路径正常，以前的小豆瓣图书也是有图片列表，但是没有出现这种情况。
- 代码结构比较烂，很多地方都没有优化处理，复用率较低，待重构。
- 页面布局有些不合理，尺寸控制的不够好。
- 部分wxml没有用模版功能代替重复的渲染工作，达不到复用效果。

### 闲语

本次编写的小程序用到了蛮多知识点，虽然花费了不少时间，但是一切都是非常的值得。编写的过程中遇到最大的困难就是解析html内容，可以说是绞尽脑汁，哈哈，智商不足啦。很期待能有网友能奉献出更好的解决方法。这个小例子做的比较简陋，很多功能没有完全实现，跟别人的Android和React仿客户端相比，小巫见大巫啦。还得抽空完成后续的更多功能。

到目前为止，小程序已经更新了几次，支持了ES5/ES6转换、下拉刷新事件、上传文件等功能，不过还有很多API还不能在模拟环境下显示效果。自己觉得一直做类似于豆瓣图书和知乎日报等除了网络请求之外没什么特别的地方的应用也不好，需要尝试新的API来扩展自己的视野，后续打算往未使用到的API进行案例制作。不知不觉已经踏出校园准备有4个月了，很怀念以前的学习日子，做过很多案例，但是都没有写日志和保存的习惯。这次写的字数蛮多的，可累死我了。很幸运自己初入工作圈就能碰上小程序风暴，期待它正式公测！

现阶段比较完整的效果动态图

![微信小程序之知乎日报效果图](http://oeiyvmnx5.bkt.clouddn.com/ZhiHuSimpleDemoFull.gif)


## 本次示例的源码地址：

### [https://github.com/oopsguy/WechatSmallApps](https://github.com/oopsguy/WechatSmallApps)


### [http://git.oschina.net/oopsguy/WechatSmallApps](http://git.oschina.net/oopsguy/WechatSmallApps)


如果大家喜欢，给个**start**激励一下我，以后会有更好的作品与大家分享:)