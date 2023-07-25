import "./nodeMenu.less";
import "./icons/iconfont.js";
import i18n from "./i18n.js";
import type { MindElixirInstance } from "mind-elixir";
import cos from "./cos";

const createDiv = (id, innerHTML) => {
  const div = document.createElement("div");
  div.id = id;
  div.innerHTML = innerHTML;
  return div;
};

const colorList = [
  "#2c3e50",
  "#34495e",
  "#7f8c8d",
  "#94a5a6",
  "#bdc3c7",
  "#ecf0f1",
  "#8e44ad",
  "#9b59b6",
  "#2980b9",
  "#3298db",
  "#c0392c",
  "#e74c3c",
  "#d35400",
  "#f39c11",
  "#f1c40e",
  "#17a085",
  "#27ae61",
  "#2ecc71",
];

export default function (mind: MindElixirInstance) {
  console.log("install node menu");
  function clearSelect(klass, remove) {
    const elems = mind.container.querySelectorAll(klass);
    [].forEach.call(elems, function (el) {
      el.classList.remove(remove);
    });
  }

  // create element
  const locale = i18n[mind.locale] ? mind.locale : "en";
  const styleDiv = createDiv(
    "nm-style",
    `
  <div class="nm-fontsize-container">
    ${["15", "24", "32"]
      .map((size) => {
        return `<div class="size"  data-size="${size}">
    <svg class="icon" style="width: ${size}px;height: ${size}px" aria-hidden="true">
      <use xlink:href="#icon-a"></use>
    </svg></div>`;
      })
      .join("")}<div class="bold"><svg class="icon" aria-hidden="true">
<use xlink:href="#icon-B"></use>
</svg></div>
  </div>
  <div class="nm-fontcolor-container">
    ${colorList
      .map((color) => {
        return `<div class="split6"><div class="palette" data-color="${color}" style="background-color: ${color};"></div></div>`;
      })
      .join("")}
  </div>
  <div class="bof">
  <span class="font">${i18n[locale].font}</span>
  <span class="background">${i18n[locale].background}</span>
  </div>`
  );
  const tagDiv = createDiv(
    "nm-tag",
    `${i18n[locale].tag}<input class="nm-tag" tabindex="-1" placeholder="${i18n[locale].tagsSeparate}" />`
  );
  const iconDiv = createDiv(
    "nm-icon",
    `${i18n[locale].icon}<input class="nm-icon" tabindex="-1" placeholder="${i18n[locale].iconsSeparate}" />`
  );
  const urlDiv = createDiv(
    "nm-url",
    `${i18n[locale].url}<input class="nm-url" tabindex="-1" />`
  );
  const memoDiv = createDiv(
    "nm-memo",
    `${
      i18n[locale].memo || "Memo"
    }<textarea class="nm-memo" rows="5" tabindex="-1" />`
  );
  const imgDiv = createDiv(
    "nm-img",
    `${i18n[locale].img || "Image"}<section class="nm-cimg">
      <input class="img-ipt" type="file" name="image" accept="image/*" tabindex="-1">
      <div class="svg img-btn">
        <svg t="1690172098075" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="17017" width="200" height="200"><path d="M1020.192947 541.265648h-460.281325v482.734352h-78.889013V541.265648H3.761254v-78.877563h477.307154V0h78.889013v462.388085h460.281325v78.877563z" fill="#CCCCCC" p-id="17018"></path></svg>
      </div>
      <div class="hidden img-container">
        <img class="img" alt="not found" />
        <svg class="icon close-img" aria-hidden="true"><use xlink:href="#icon-close"></use></svg>
      </div>
      <label class="label">
        <input tabindex="-1" placeholder="width" data-width="width" type="number" />
        <input tabindex="-1" placeholder="height" data-height="height" type="number" />
      </label>
    </section>
    `
  );

  // create container
  const menuContainer = document.createElement("div");
  menuContainer.className = "node-menu";
  menuContainer.innerHTML = `
  <div class="button-container"><svg class="icon" aria-hidden="true">
  <use xlink:href="#icon-close"></use>
  </svg></div>
  `;
  menuContainer.appendChild(styleDiv);
  menuContainer.appendChild(tagDiv);
  menuContainer.appendChild(iconDiv);
  menuContainer.appendChild(urlDiv);
  menuContainer.appendChild(imgDiv);
  menuContainer.appendChild(memoDiv);
  menuContainer.hidden = true;
  mind.container.append(menuContainer);

  // query input element
  const sizeSelector = menuContainer.querySelectorAll(".size");
  const bold: HTMLElement = menuContainer.querySelector(".bold");
  const buttonContainer: HTMLElement =
    menuContainer.querySelector(".button-container");
  const fontBtn: HTMLElement = menuContainer.querySelector(".font");
  const tagInput: HTMLInputElement = mind.container.querySelector(".nm-tag");
  const iconInput: HTMLInputElement = mind.container.querySelector(".nm-icon");
  const urlInput: HTMLInputElement = mind.container.querySelector(".nm-url");
  const memoInput: HTMLInputElement = mind.container.querySelector(".nm-memo");
  // img
  const fileInput: HTMLInputElement = mind.container.querySelector(".img-ipt");
  const imgBtn: HTMLInputElement = mind.container.querySelector(".img-btn");
  const img: HTMLInputElement = mind.container.querySelector(".img-container");
  const label: HTMLInputElement = mind.container.querySelector(".label");

  // handle input and button click
  let bgOrFont;
  const E = mind.findEle;
  menuContainer.onclick = (e) => {
    if (!mind.currentNode) return;
    const nodeObj = mind.currentNode.nodeObj;
    const target = e.target as HTMLElement;
    if (target.className === "palette") {
      clearSelect(".palette", "nmenu-selected");
      target.className = "palette nmenu-selected";
      const color = target.dataset.color;
      const patch = { style: {} as any };
      if (bgOrFont === "font") {
        patch.style.color = color;
      } else if (bgOrFont === "background") {
        patch.style.background = color;
      }
      console.log(patch);
      mind.reshapeNode(mind.currentNode, patch);
    } else if (target.className === "background") {
      clearSelect(".palette", "nmenu-selected");
      bgOrFont = "background";
      target.className = "background selected";
      target.previousElementSibling.className = "font";
      if (nodeObj.style && nodeObj.style.background) {
        menuContainer.querySelector(
          '.palette[data-color="' + nodeObj.style.background + '"]'
        ).className = "palette nmenu-selected";
      }
    } else if (target.className === "font") {
      clearSelect(".palette", "nmenu-selected");
      bgOrFont = "font";
      target.className = "font selected";
      target.nextElementSibling.className = "background";
      if (nodeObj.style && nodeObj.style.color) {
        menuContainer.querySelector(
          '.palette[data-color="' + nodeObj.style.color + '"]'
        ).className = "palette nmenu-selected";
      }
    }
  };
  Array.from(sizeSelector).map((dom) => {
    (dom as HTMLElement).onclick = (e) => {
      clearSelect(".size", "size-selected");
      const size = e.currentTarget as HTMLElement;
      size.className = "size size-selected";
      mind.reshapeNode(mind.currentNode, {
        style: { fontSize: size.dataset.size },
      });
    };
  });
  bold.onclick = (e: MouseEvent & { currentTarget: Element }) => {
    let fontWeight = "";
    if (mind.currentNode.nodeObj?.style?.fontWeight === "bold") {
      e.currentTarget.className = "bold";
    } else {
      fontWeight = "bold";
      e.currentTarget.className = "bold size-selected";
    }
    mind.reshapeNode(mind.currentNode, { style: { fontWeight } });
  };
  tagInput.onchange = (e: InputEvent & { target: HTMLInputElement }) => {
    if (!mind.currentNode) return;
    if (typeof e.target.value === "string") {
      const newTags = e.target.value.split(",");
      mind.reshapeNode(mind.currentNode, {
        tags: newTags.filter((tag) => tag),
      });
    }
  };
  iconInput.onchange = (e: InputEvent & { target: HTMLInputElement }) => {
    if (!mind.currentNode) return;
    if (typeof e.target.value === "string") {
      const newIcons = e.target.value.split(",");
      mind.reshapeNode(mind.currentNode, {
        icons: newIcons.filter((icon) => icon),
      });
    }
  };
  urlInput.onchange = (e: InputEvent & { target: HTMLInputElement }) => {
    if (!mind.currentNode) return;
    mind.reshapeNode(mind.currentNode, { hyperLink: e.target.value });
  };
  memoInput.onchange = (e: InputEvent & { target: HTMLInputElement }) => {
    if (!mind.currentNode) return;
    mind.currentNode.nodeObj.memo = e.target.value;
    mind.bus.fire("operation", {
      name: "updateMemo",
      obj: mind.currentNode.nodeObj,
    });
  };

  const proxy = new Proxy(
    {
      url: "",
      height: "90",
      width: "90",
    },
    {
      set: function (target, property, value) {
        target[property] = value;
        if (property === "url") {
          img.children[0].src = value;
          if (value !== "") {
            img.className = "img-container";
            imgBtn.className = "svg img-btn hidden";
          } else {
            img.className = "hidden img-container";
            imgBtn.className = "svg img-btn";
          }
        }
        if (property === "width") {
          label.children[0].value = value;
        }
        if (property === "height") {
          label.children[1].value = value;
        }
        updataImg();
        return true;
      },
    }
  );
  imgBtn.onclick = (e) => {
    fileInput.click();
  };
  fileInput.onchange = (e: InputEvent & { target: HTMLInputElement }) => {
    const file = e.target.files[0];
    new cos(file).uploadFile().then((res) => {
      if (!res.Location.includes("https")) {
        proxy.url = "https://" + res.Location;
      }
    });
  };
  img.children[1].onclick = (e) => {
    proxy.url = "";
  };
  Array.from(label.children).map((dom) => {
    (dom as HTMLElement).onchange = (e) => {
      let temp = e.target.dataset.width || e.target.dataset.height;
      proxy[temp] = e.target.value;
    };
  });
  function updataImg() {
    if (proxy.url === "") {
      mind.reshapeNode(mind.currentNode, { image: null });
    } else {
      mind.reshapeNode(mind.currentNode, { image: {...proxy} });
    }
  }

  let state = "open";
  buttonContainer.onclick = (e) => {
    menuContainer.classList.toggle("close");
    if (state === "open") {
      state = "close";
      buttonContainer.innerHTML = `<svg class="icon" aria-hidden="true"><use xlink:href="#icon-menu"></use></svg>`;
    } else {
      state = "open";
      buttonContainer.innerHTML = `<svg class="icon" aria-hidden="true"><use xlink:href="#icon-close"></use></svg>`;
    }
  };

  // handle node selection
  mind.bus.addListener("unselectNode", function () {
    menuContainer.hidden = true;
  });
  // 刚打开时的初始化
  mind.bus.addListener("selectNode", function (nodeObj, clickEvent) {
    if (!clickEvent) return;
    menuContainer.hidden = false;
    clearSelect(".palette", "nmenu-selected");
    clearSelect(".size", "size-selected");
    clearSelect(".bold", "size-selected");
    bgOrFont = "font";
    fontBtn.className = "font selected";
    fontBtn.nextElementSibling.className = "background";
    if (nodeObj.style) {
      if (nodeObj.style.fontSize) {
        menuContainer.querySelector(
          '.size[data-size="' + nodeObj.style.fontSize + '"]'
        ).className = "size size-selected";
      }
      if (nodeObj.style.fontWeight) {
        menuContainer.querySelector(".bold").className = "bold size-selected";
      }
      if (nodeObj.style.color) {
        menuContainer.querySelector(
          '.palette[data-color="' + nodeObj.style.color + '"]'
        ).className = "palette nmenu-selected";
      }
    }
    if (nodeObj.tags) {
      tagInput.value = nodeObj.tags.join(",");
    } else {
      tagInput.value = "";
    }
    if (nodeObj.icons) {
      iconInput.value = nodeObj.icons.join(",");
    } else {
      iconInput.value = "";
    }
    urlInput.value = nodeObj.hyperLink || "";
    memoInput.value = nodeObj.memo || "";

    // img
    console.log(nodeObj?.image);
    
    proxy.url = nodeObj?.image?.url || "";
    proxy.width = nodeObj?.image?.width || 90;
    proxy.height = nodeObj?.image?.height || 90;
  });
}
