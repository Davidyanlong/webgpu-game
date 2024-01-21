#学习总结

### 视频链接
 [https://www.youtube.com/watch?v=j4jtjk_1wcQ&list=PLCnmpqh8sKKynYSJqrrC0nWwPB3OVf5lt](https://www.youtube.com/watch?v=j4jtjk_1wcQ&list=PLCnmpqh8sKKynYSJqrrC0nWwPB3OVf5lt)

 ### 内容介绍
    一套使用WebGPU开发2D游戏的示例，通过该套视频，基本可以了解WebGPU渲染管线的相关内容，但由于是2D游戏，所以部分3D相关的管线或状态值的设置是不存在的。该套教程基本从项目的搭建到最后的后处理，我的每一次提交也是根据视频来的。

### 游戏的亮度

1. 作者对2D的精灵图，使用了多种渲染方式，并优化了内存，将多个不同的精灵图放在了一个buffer中，通过设置阈值，大约一定数量后再次创建buffer
2. 作者采用简单的模式启动游戏，基本上就是 初始化， 更新， 绘制 三个过程，每一个过程都将相关的功能加入到对应的对应的调度事件中。