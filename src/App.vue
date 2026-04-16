<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
onLaunch(() => {
  console.log("App Launch");
});
onShow(() => {
  console.log("App Show");
});
onHide(() => {
  console.log("App Hide");
});
</script>
<style>
/* 全局样式 */
page {
  background-color: #f8f8f8;
  font-size: 16px;
  line-height: 1.6;
}

view, text, image {
  box-sizing: border-box;
}
</style>
