import Vue from 'vue';
import MuseUI from 'muse-ui';
import 'muse-ui/dist/muse-ui.css';

import Toast from 'muse-ui-toast';
import Message from 'muse-ui-message';
import Loading from 'muse-ui-loading';
import 'muse-ui-loading/dist/muse-ui-loading.css';
import 'muse-ui-message/dist/muse-ui-message.css';
import Helpers from 'muse-ui/lib/Helpers';
import theme from 'muse-ui/lib/theme';
import * as colors from 'muse-ui/lib/theme/colors';

Vue.use(Helpers);
Vue.use(Loading, {
    overlayColor: '#9e9e9e5d',        // 背景色
    size: 48,
    color: 'primary',                           // color
    className: ''                               // loading class name
});
Vue.use(Message);
Vue.use(Toast);

Vue.use(MuseUI);
//0 蓝，1 红，2 紫，3 洋红,4 青 ，5 黄
const Cyberpunk = ["#153ad0", "#d11b58", "#4a1798", "#c52dd0", "#40d3fc", "#feeb73"]
theme.add('Cyberpunk', {
    primary: Cyberpunk[4],
    secondary: colors.amber,
    text: {
        primary: colors.grey200,
        secondary: 'rgba(255, 255, 255, 0.7)',
        alternate: '#303030',
        disabled: 'rgba(255, 255, 255, 0.3)',
        hint: 'rgba(255, 255, 255, 0.3)' // 提示文字颜色
    },
}, 'dark');
theme.addCreateTheme(() => {
    return `
    html {
        height:100%
    }
    body {
        background-image: radial-gradient(${Cyberpunk[3]}7a,${Cyberpunk[2]}7a, #0300137a);
        color: #ffffff;
        background-color: black;
        height:100%;
    }
    .mu-item {
        color :${Cyberpunk[4]};
        text-shadow: 0px 2px 2px ${Cyberpunk[3]};
    }
    .mu-item:hover {
        color : #ffb4f6;
        background:#000;
    }
    .mu-item.is-selected>.mu-item-title{
        color: #ffb4f6;
        text-shadow: 0px 0px 1px ${Cyberpunk[2]}, 0px 0px 4px ${Cyberpunk[3]}, 0px 0px 5px #ffffff;
    }
    .mu-badge {
        color : ${Cyberpunk[4]};
        background : ${Cyberpunk[2]};
    }
    .mu-paper {
        background: #0000000f;
    }
    .mu-appbar{
        background: #000;
        color :${Cyberpunk[4]}
    }
    .mu-dialog{
        background: #0000009e url(dbg.jpg);
        background-blend-mode: darken;
        box-shadow: 
        inset 0px -2px 5px 0px ${Cyberpunk[3]}, 
        inset 0px -7px 10px 1px ${Cyberpunk[0]},
        inset 0 3px 14px 2px ${Cyberpunk[2]},
        0 2px 2px 2px black;
        border: 1px solid ${Cyberpunk[4]};
        position:relative;
    }
    .mu-dialog:before{
        content: "";
        position: absolute;
        width: 50px;
        height: 0;
        border: 10px solid ${Cyberpunk[4]};
        top: -10px;
        left: -1px;
        border-right: 10px solid transparent;
        border-top: 0;
    }
    .mu-dialog:after{
        content: "";
        position: absolute;
        width: 50px;
        height: 0;
        border: 10px solid ${Cyberpunk[4]};
        border-left: 10px solid transparent;
        border-bottom: 0;
        right: -1px;
    }
    .mu-dialog-title {
        font-weight: lighter;
        color : ${colors.grey300};
        text-shadow: 
        1px 1px 2px ${Cyberpunk[4]},
        -1px -1px 2px ${Cyberpunk[4]},
        1px -1px 2px ${Cyberpunk[4]},
        -1px 1px 2px ${Cyberpunk[4]};
    }
    .mu-dialog-body {
        color : ${colors.grey200};
    }
    .mu-button {
        color:  ${Cyberpunk[4]};
    }
    .mu-button :hover{
        color:  white;
        text-shadow: 0px 0px 3px ${colors.cyanA200};
    }
    .mu-table {
        background: #00000047;
        box-shadow: 0 0 5px ${Cyberpunk[4]},inset 0 0 5px ${Cyberpunk[4]},0 0 0 1px ${Cyberpunk[4]};
        border-radius: 5px;
    }
    .mu-table-empty {
        color : white;
    }
    .mu-table th {
        color: ${Cyberpunk[1]};
        text-shadow: 0px 0px 2px ${Cyberpunk[1]};
    }
    .mu-table tr {
        color: ${Cyberpunk[4]};
    }
    .mu-table tr.is-hover {
        background: #000;
        color: white;
        text-shadow: 0px 0px 3px ${Cyberpunk[4]};
    }
    .mu-flat-button {
        color: ${Cyberpunk[4]};
    }
    .mu-card {
        background: #9e9e9e1d;
        border: 1px solid #ffffffa8;
    }
    .mu-card-title-container .mu-card-title {
        color: ${Cyberpunk[5]};
    }
    .mu-card-title-container .mu-card-sub-title {
        color: ${Cyberpunk[3]};
    }
    .mu-tabs-inverse {
        background: transparent;
        color:${colors.grey200};
    }
    .mu-tab :hover {
        color: white;
    }
    .mu-tab-active.is-inverse {
        color: ${Cyberpunk[4]};
    }
    .mu-tab-active.is-inverse :hover {
        color: ${Cyberpunk[4]};
        text-shadow: 0px 0px 3px ${Cyberpunk[4]};
    }
    .mu-tab-link-highlight {
        box-shadow: 0 -2px 5px 1px ${Cyberpunk[4]};
    }
    .mu-tab-active.is-inverse.hover ~ .mu-tab-link-highlight {
        box-shadow: 0 -2px 5px 3px ${Cyberpunk[4]};
    }
    .mu-input-line{
        background:${Cyberpunk[4]};
    }
    .mu-input ,.mu-text-field-input{
        color : ${Cyberpunk[5]};
    }
    .mu-input-help {
        color : ${Cyberpunk[3]};
    }
    .mu-input.has-label .mu-input-label.float{
        color : ${Cyberpunk[0]};
    }
    .mu-switch-label,.mu-checkbox ,.mu-checkbox-label,.mu-checkbox-checked{
        color : ${Cyberpunk[4]};
    }
    .mu-switch-track {
        box-shadow: 0px 0px 2px 2px black inset, 0 0 10px 0px ${Cyberpunk[4]};
        background: #1f6e84;
    }
    .mu-switch-checked .mu-switch-track {
        background: ${Cyberpunk[4]};
        opacity :1;
    }
    .mu-switch-thumb
    {
        box-shadow: 0 5px 4px 0 #383838 inset;
        background: black;
    }
    .mu-switch-checked .mu-switch-thumb{
        box-shadow: 0 5px 4px 0 #383838 inset;
        background: black;
    }
    `;
});
theme.use('Cyberpunk')