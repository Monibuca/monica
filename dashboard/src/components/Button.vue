<template>
  <div v-on="$listeners" :class="(isMouseDown?'a mousedown':'a')" @mousedown="isMouseDown=true" @mouseup="isMouseDown=false" @mouseleave="isMouseDown=false">
      <component :is="href?'a':'div'" :href="href" target="_blank" :class="(blink?' b blink':'b')">
          <slot name="default"/>
      </component>
  </div>
</template>

<script>
export default {
    props:{
        href:String,
        blink:Boolean
    },
    data(){
        return {
            isMouseDown:false
        }
    }
}
</script>

<style lang="less" scoped>
@mainColor :#feeb73;
@keyframes blink {
    0% {
        box-shadow:  0 0 5px 1px white inset,0 -10px 10px 1px @mainColor inset,2px 2px 3px 0 @mainColor;
    }
    50% {
        box-shadow: 0 0 10px 0px white inset,0 0 3px 0px @mainColor;
    }
    100% {
        box-shadow:  0 0 5px 1px white inset,0 -10px 10px 1px @mainColor inset,2px 2px 3px 0 @mainColor;
    }
}

.a{
    margin: auto;
    width: 80px;
    height:30px;
    background: @mainColor;
    text-align: center;
    line-height: 30px;
    box-shadow: 0 0 5px 1px black inset,0 0 3px 0px @mainColor,0 0 10px 0 black inset,0 -10px 30px 0 black inset;
    color: rgba(255, 255, 255, 0.521);
    text-shadow: 0 0 3px @mainColor;
    position: relative;
    display: inline-block;
    cursor: pointer;
    margin: 5px;
}

.b{
    top: -2px;
    left: -2px;
    position: absolute;
    width: 80px;
    height:30px;
    box-shadow: 0 0 10px 0px white inset,0 0 3px 0px @mainColor;
    display:block;
    font-size: 13px;
}
.mousedown .b{
    top:-1px;
    left:-1px;
}
.b:hover{
    color: white;
    box-shadow:  0 0 5px 1px white inset,0 -10px 10px 1px @mainColor inset,2px 2px 3px 0 @mainColor;
}

.blink {
    animation: blink 1s infinite;
}
</style>>