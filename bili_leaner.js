// ==UserScript==
// @name            哔哩哔哩——学习模式
// @name:en         Bilibili-Leaner
// @namespace       http://tampermonkey.net/
// @version         1.1
// @description     屏蔽特定标签的视频，并替换成“滚去学习”字样
// @description:en  Block videos with specific tags and replace them with the message "Go study."
// @author          GooZy
// @source          https://github.com/GooZy/Bilibili-Leaner
// @license         MIT
// @match           *://www.bilibili.com/video/*
// @match           *://bilibili.com/video/*
// @icon            https://static.hdslb.com/mobile/img/512.png
// @run-at          document-end
// @grant           GM_setValue
// @grant           GM_getValue
// @grant           GM_registerMenuCommand
// ==/UserScript==


(function() {
    'use strict';

    // 配置页初始化
    initConfigPage();

    // 获取配置
    const savedConfig = getSavedConfig();
    const allowedTags = savedConfig.allowedTags.split(' ').map(tag => tag.trim());
    const blockedTimes = savedConfig.blockedTime.split(' ').map(time => time.trim());

    // 是否可见标签
    var isAvaliableTag = checkVideoTagAvaliable(allowedTags)
    // 是否可用时段
    var isAvaliableTime = checkTimeAvaliable(blockedTimes)

    console.log("时段校验结果：", isAvaliableTime, "标签校验结果：", isAvaliableTag)
    if (isAvaliableTime || isAvaliableTag) {
        return
    }

    processHideVideo()

})();

/**
 * 校验当前视频标签是否允许观看
 */
function checkVideoTagAvaliable(allowedTags) {
    const elements = document.getElementsByClassName("tag not-btn-tag");
    for (let i = 0; i < elements.length; ++i) {
        const tagName = elements[i].innerText;
        if (allowedTags.includes(tagName)) {
            return true;
        }
    }
    return false;
}

/**
 * 校验当前时段是否可以打开B站
 */
function checkTimeAvaliable(blockedTimes) {
    const date = new Date();
    const hour = date.getHours();

    for (let i = 0; i < blockedTimes.length; ++i) {
        const blockedTime = blockedTimes[i];
        const [startHour, endHour] = blockedTime.split('-').map(time => parseInt(time.trim()));
        if (hour >= startHour && hour < endHour) {
            return true;
        }
    }

    return false;
}

function processHideVideo() {
    var playerElme = document.getElementById("playerWrap");

    // 创建一个新的 div 元素，作为替换的内容
    var newElement = document.createElement("div");
    newElement.className = "bilibili-player-placeholder";
    newElement.innerHTML = "快滚去学习😡";

    // 替换 video 元素为新的 div 元素
    playerElme.replaceWith(newElement);
}

function getSavedConfig() {
    const allowedTags = GM_getValue('allowedTags', '');
    const blockedTime = GM_getValue('blockedTime', '');
    console.log("allowTags:", allowedTags, "blockedTime:", blockedTime)
    return { allowedTags, blockedTime };
}

function initConfigPage() {

    function openConfigModal() {
        const existingModal = document.getElementById('configModal');
        if (!existingModal) {
            const modalContainer = document.createElement('div');
            modalContainer.innerHTML = getConfigPage();
            document.body.appendChild(modalContainer);

            const saveConfigBtn = document.getElementById('saveConfigBtn');
            const cancelConfigBtn = document.getElementById('cancelConfigBtn');
            const tagInputContainer = document.getElementById('tagInputContainer');
            const timeInputContainer = document.getElementById('timeInputContainer');
            const allowedTagsInput = document.getElementById('allowedTagsInput');
            const blockedTimeInput = document.getElementById('blockedTime');

            const savedConfig = getSavedConfig();
            const allowedTags = savedConfig.allowedTags.split(' ');
            const blockedTimes = savedConfig.blockedTime.split(' ');

            allowedTags.forEach(tag => {
                const tagElement = document.createElement('div');
                tagElement.className = 'tag';
                tagElement.textContent = tag;
                tagInputContainer.appendChild(tagElement);
            });
            blockedTimes.forEach(time => {
                const tagElement = document.createElement('div');
                tagElement.className = 'tag';
                tagElement.textContent = time;
                timeInputContainer.appendChild(tagElement);
            });

            allowedTagsInput.value = savedConfig.allowedTags;
            blockedTimeInput.value = savedConfig.blockedTime;

            saveConfigBtn.addEventListener('click', saveConfig);
            cancelConfigBtn.addEventListener('click', closeConfigModal);
            allowedTagsInput.addEventListener('input', updateTags);
            blockedTimeInput.addEventListener('input', updateTimes);
        }
    }

    function updateTags(event) {
        const tagInputContainer = document.getElementById('tagInputContainer');
        const tags = event.target.value.split(' ').filter(tag => tag.trim() !== '');

        tagInputContainer.innerHTML = '';

        tags.forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.className = 'tag';
            tagElement.textContent = tag;
            tagInputContainer.appendChild(tagElement);
        });
    }

    function updateTimes(event) {
        const timeInputContainer = document.getElementById('timeInputContainer');
        const tags = event.target.value.split(' ').filter(tag => tag.trim() !== '');

        timeInputContainer.innerHTML = '';

        tags.forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.className = 'tag';
            tagElement.textContent = tag;
            timeInputContainer.appendChild(tagElement);
        });
    }

    function saveConfig() {
        const allowedTagsInput = document.getElementById('allowedTagsInput');
        const blockedTimeInput = document.getElementById('blockedTime');

        GM_setValue('allowedTags', allowedTagsInput.value);
        GM_setValue('blockedTime', blockedTimeInput.value.trim());

        closeConfigModal();
    }

    function closeConfigModal() {
        const configModal = document.getElementById('configModal');
        if (configModal) {
            configModal.remove();
        }
    }

    GM_registerMenuCommand(getLocalizedText("configCommand"), openConfigModal);

    function getConfigPage() {
        return `
        <style>
            .tag-input {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                border: 1px solid #ccc;
                padding: 5px;
            }

            .tag-container {
                display: inline-block;
                width: auto;
                border: none;
                outline: none;
                background-color: transparent;
                font-size: 14px;
            }

            .tag {
                background-color: #f0f0f0;
                padding: 2px 5px;
                border-radius: 3px;
                margin: 2px;
                display: inline-block;
            }

            #configModal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.9);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
            }

            #configContainer {
                background: white;
                padding: 20px;
                border-radius: 8px;
                max-width: 400px;
                text-align: center;
            }
        </style>

        <div id="configModal">
            <div id="configContainer">
                <h3 style="margin-bottom: 20px;">${getLocalizedText("configTitle")}</h3>

                <label for="blockedTime">${getLocalizedText("blockedTimeLabel")}:</label><br>
                <input type="text" id="blockedTime" style="width: 100%;"><br>
                <div id="timeInputContainer" class="tag-container" style="width: 100%;"></div><br>

                <label for="allowedTagsInput">${getLocalizedText("allowedTagsLabel")}:</label><br>
                <input type="text" id="allowedTagsInput" class="tag-input" style="width: 100%;">
                <div id="tagInputContainer" class="tag-container" style="width: 100%;"></div><br>

                <button id="saveConfigBtn" style="margin-right: 10px;">${getLocalizedText("saveConfigBtn")}</button>
                <button id="cancelConfigBtn">${getLocalizedText("cancelConfigBtn")}</button>
            </div>
        </div>
    `;
    }
}

function getLocalizedText(key) {

    // 获取用户首选语言
    const userLanguages = navigator.languages || [navigator.language || navigator.userLanguage];
    const preferredLanguage = userLanguages.find(lang => lang.startsWith('zh')) || 'en'; // 如果找不到中文，就使用英文
    // 提取语言参数（例如：zh-CN -> zh）
    const languageParam = preferredLanguage.substring(0, 2);
    
    const translations = {
        "configTitle": {
            "zh": "配置学习模式",
            "en": "Configure Learning Mode"
        },
        "blockedTimeLabel": {
            "zh": "允许打开B站的时段（24小时制，例如 22-23，空格分隔）:",
            "en": "Allowed Bilibili opening time slots (24-hour format, e.g. 22-23, separated by space):"
        },
        "allowedTagsLabel": {
            "zh": "非允许时段，允许的视频标签（用空格分隔）:",
            "en": "Allowed video tags outside restricted time slots (separated by space):"
        },
        "saveConfigBtn": {
            "zh": "保存配置",
            "en": "Save Configuration"
        },
        "cancelConfigBtn": {
            "zh": "取消",
            "en": "Cancel"
        },
        "goStudyText": {
            "zh": "快滚去学习😡",
            "en": "Go study! 😡"
        },
        "configCommand": {
            "zh": "配置学习模式",
            "en": "Configure Learning Mode"
        }
    };

    return translations[key][languageParam];
}