使用方法: 在ACT的悬浮窗插件内点击新建, 创建一个"数据统计"类型的悬浮窗, 名称任意. 然后选中新建的这个悬浮窗, 点击"悬浮窗路径->浏览", 并选择Caiji文件夹下的index.html.
屏幕上会出现三个小小的控件:一个是">>>>", 用来折叠和展开. 一个是"+", 打开一个简易(陋)的搜索界面. 一个是黄色的方块, 用来调整窗口的大小.
然后可以通过搜索界面添加时钟. 也可以通过游戏内的宏:/echo Add_alarm <item>, 在右键游戏内物品点击展示物品属性后发送该宏添加定时器(也可以直接输入物品名称).
通过时钟右上角的X可以关闭并删除闹钟.

每次添加删除时钟的时候都会自动保存当前的列表, 并在下一次加载时自动读取.

通过更换文件夹内的Alert.ogg可以更换自己想要的铃声(注意一定要是Alert.ogg, 名称要一样, 格式是ogg)

若出现Bug, 请QQ联系: 83885877, 或发送电子邮件. 十分感谢.

本插件开发并测试于ngld's OverlayPlugin, 可能与其他版本并不兼容, 以实际使用情况为准.

打开caiji.css可以自行修改css.
caiji.js引用了部分来自 https://gist.github.com/zyzsdy/ecf41a4cc04e2f95839a72291a207347 的代码片段, 以计算艾欧泽亚时间, 并且添加了两个方法.
caiji.js通过 https://allorigins.win/ 以跨源(CORS Proxy)获取采集点信息
caiji.js的采集点信息均在启动时更新自 https://ff14.huijiwiki.com/
caiji.js的物品图标等信息均来自 https://cafemaker.wakingsands.com/
Alert.ogg的license: 
We acquired them from the BigWigs World of Warcraft addon
project, and were told these were contributed from an unknown
source. We believe these sounds come from freesound.org,
which would make them licensed under the Creative Commons
License.

除此之外, caiji.js以MIT协议进行开源, 请在转载时保留以上声明及如下的作者信息:

Shiroko <hhx.xxm@gmail.com> (激萌用户酱@紫水栈桥)

