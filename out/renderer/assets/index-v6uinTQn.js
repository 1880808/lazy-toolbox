import { r as ref, o as onMounted, n as nextTick, a as onPopupReopen, w as watch, b as windowWidth, c as windowHeight, u as useRect, d as createVNode, e as createNamespace, f as defineComponent, g as useChildren, t as truthProp, h as withInstall, i as extend, j as routeProps, k as useRoute, l as useParent, m as computed, p as useExpose, B as Button, q as popupSharedProps, s as numericProp, v as unknownProp, x as makeStringProp, y as popupSharedPropKeys, z as reactive, A as withKeys, C as mergeProps, D as pick, E as addUnit, P as Popup, F as noop, G as isFunction, H as BORDER_LEFT, I as BORDER_TOP, J as callInterceptor, K as inBrowser, L as mountComponent, M as usePopupState, N as defineStore, S as Storage, _ as _export_sfc, O as createElementBlock, Q as createBaseVNode, R as Fragment, T as renderList, U as unref, V as createTextVNode, W as withCtx, X as showToast, Y as openBlock, Z as normalizeClass, $ as toDisplayString, a0 as Icon, a1 as Field, a2 as useRouter } from "./index-DIbb-_UH.js";
const useHeight = (element, withSafeArea) => {
  const height = ref();
  const setHeight = () => {
    height.value = useRect(element).height;
  };
  onMounted(() => {
    nextTick(setHeight);
    {
      for (let i = 1; i <= 3; i++) {
        setTimeout(setHeight, 100 * i);
      }
    }
  });
  onPopupReopen(() => nextTick(setHeight));
  watch([windowWidth, windowHeight], setHeight);
  return height;
};
function usePlaceholder(contentRef, bem2) {
  const height = useHeight(contentRef);
  return (renderContent) => createVNode("div", {
    "class": bem2("placeholder"),
    "style": {
      height: height.value ? `${height.value}px` : void 0
    }
  }, [renderContent()]);
}
const [name$2, bem$2] = createNamespace("action-bar");
const ACTION_BAR_KEY = Symbol(name$2);
const actionBarProps = {
  placeholder: Boolean,
  safeAreaInsetBottom: truthProp
};
var stdin_default$2 = defineComponent({
  name: name$2,
  props: actionBarProps,
  setup(props, {
    slots
  }) {
    const root = ref();
    const renderPlaceholder = usePlaceholder(root, bem$2);
    const {
      linkChildren
    } = useChildren(ACTION_BAR_KEY);
    linkChildren();
    const renderActionBar = () => {
      var _a;
      return createVNode("div", {
        "ref": root,
        "class": [bem$2(), {
          "van-safe-area-bottom": props.safeAreaInsetBottom
        }]
      }, [(_a = slots.default) == null ? void 0 : _a.call(slots)]);
    };
    return () => {
      if (props.placeholder) {
        return renderPlaceholder(renderActionBar);
      }
      return renderActionBar();
    };
  }
});
const ActionBar = withInstall(stdin_default$2);
const [name$1, bem$1] = createNamespace("action-bar-button");
const actionBarButtonProps = extend({}, routeProps, {
  type: String,
  text: String,
  icon: String,
  color: String,
  loading: Boolean,
  disabled: Boolean
});
var stdin_default$1 = defineComponent({
  name: name$1,
  props: actionBarButtonProps,
  setup(props, {
    slots
  }) {
    const route = useRoute();
    const {
      parent,
      index: index2
    } = useParent(ACTION_BAR_KEY);
    const isFirst = computed(() => {
      if (parent) {
        const prev = parent.children[index2.value - 1];
        return !(prev && "isButton" in prev);
      }
    });
    const isLast = computed(() => {
      if (parent) {
        const next = parent.children[index2.value + 1];
        return !(next && "isButton" in next);
      }
    });
    useExpose({
      isButton: true
    });
    return () => {
      const {
        type,
        icon,
        text,
        color,
        loading,
        disabled
      } = props;
      return createVNode(Button, {
        "class": bem$1([type, {
          last: isLast.value,
          first: isFirst.value
        }]),
        "size": "large",
        "type": type,
        "icon": icon,
        "color": color,
        "loading": loading,
        "disabled": disabled,
        "onClick": route
      }, {
        default: () => [slots.default ? slots.default() : text]
      });
    };
  }
});
const ActionBarButton = withInstall(stdin_default$1);
const [name, bem, t] = createNamespace("dialog");
const dialogProps = extend({}, popupSharedProps, {
  title: String,
  theme: String,
  width: numericProp,
  message: [String, Function],
  callback: Function,
  allowHtml: Boolean,
  className: unknownProp,
  transition: makeStringProp("van-dialog-bounce"),
  messageAlign: String,
  closeOnPopstate: truthProp,
  showCancelButton: Boolean,
  cancelButtonText: String,
  cancelButtonColor: String,
  cancelButtonDisabled: Boolean,
  confirmButtonText: String,
  confirmButtonColor: String,
  confirmButtonDisabled: Boolean,
  showConfirmButton: truthProp,
  closeOnClickOverlay: Boolean
});
const popupInheritKeys = [...popupSharedPropKeys, "transition", "closeOnPopstate"];
var stdin_default = defineComponent({
  name,
  props: dialogProps,
  emits: ["confirm", "cancel", "keydown", "update:show"],
  setup(props, {
    emit,
    slots
  }) {
    const root = ref();
    const loading = reactive({
      confirm: false,
      cancel: false
    });
    const updateShow = (value) => emit("update:show", value);
    const close = (action) => {
      var _a;
      updateShow(false);
      (_a = props.callback) == null ? void 0 : _a.call(props, action);
    };
    const getActionHandler = (action) => () => {
      if (!props.show) {
        return;
      }
      emit(action);
      if (props.beforeClose) {
        loading[action] = true;
        callInterceptor(props.beforeClose, {
          args: [action],
          done() {
            close(action);
            loading[action] = false;
          },
          canceled() {
            loading[action] = false;
          }
        });
      } else {
        close(action);
      }
    };
    const onCancel = getActionHandler("cancel");
    const onConfirm = getActionHandler("confirm");
    const onKeydown = withKeys((event) => {
      var _a, _b;
      if (event.target !== ((_b = (_a = root.value) == null ? void 0 : _a.popupRef) == null ? void 0 : _b.value)) {
        return;
      }
      const onEventType = {
        Enter: props.showConfirmButton ? onConfirm : noop,
        Escape: props.showCancelButton ? onCancel : noop
      };
      onEventType[event.key]();
      emit("keydown", event);
    }, ["enter", "esc"]);
    const renderTitle = () => {
      const title = slots.title ? slots.title() : props.title;
      if (title) {
        return createVNode("div", {
          "class": bem("header", {
            isolated: !props.message && !slots.default
          })
        }, [title]);
      }
    };
    const renderMessage = (hasTitle) => {
      const {
        message,
        allowHtml,
        messageAlign
      } = props;
      const classNames = bem("message", {
        "has-title": hasTitle,
        [messageAlign]: messageAlign
      });
      const content = isFunction(message) ? message() : message;
      if (allowHtml && typeof content === "string") {
        return createVNode("div", {
          "class": classNames,
          "innerHTML": content
        }, null);
      }
      return createVNode("div", {
        "class": classNames
      }, [content]);
    };
    const renderContent = () => {
      if (slots.default) {
        return createVNode("div", {
          "class": bem("content")
        }, [slots.default()]);
      }
      const {
        title,
        message,
        allowHtml
      } = props;
      if (message) {
        const hasTitle = !!(title || slots.title);
        return createVNode("div", {
          "key": allowHtml ? 1 : 0,
          "class": bem("content", {
            isolated: !hasTitle
          })
        }, [renderMessage(hasTitle)]);
      }
    };
    const renderButtons = () => createVNode("div", {
      "class": [BORDER_TOP, bem("footer")]
    }, [props.showCancelButton && createVNode(Button, {
      "size": "large",
      "text": props.cancelButtonText || t("cancel"),
      "class": bem("cancel"),
      "style": {
        color: props.cancelButtonColor
      },
      "loading": loading.cancel,
      "disabled": props.cancelButtonDisabled,
      "onClick": onCancel
    }, null), props.showConfirmButton && createVNode(Button, {
      "size": "large",
      "text": props.confirmButtonText || t("confirm"),
      "class": [bem("confirm"), {
        [BORDER_LEFT]: props.showCancelButton
      }],
      "style": {
        color: props.confirmButtonColor
      },
      "loading": loading.confirm,
      "disabled": props.confirmButtonDisabled,
      "onClick": onConfirm
    }, null)]);
    const renderRoundButtons = () => createVNode(ActionBar, {
      "class": bem("footer")
    }, {
      default: () => [props.showCancelButton && createVNode(ActionBarButton, {
        "type": "warning",
        "text": props.cancelButtonText || t("cancel"),
        "class": bem("cancel"),
        "color": props.cancelButtonColor,
        "loading": loading.cancel,
        "disabled": props.cancelButtonDisabled,
        "onClick": onCancel
      }, null), props.showConfirmButton && createVNode(ActionBarButton, {
        "type": "danger",
        "text": props.confirmButtonText || t("confirm"),
        "class": bem("confirm"),
        "color": props.confirmButtonColor,
        "loading": loading.confirm,
        "disabled": props.confirmButtonDisabled,
        "onClick": onConfirm
      }, null)]
    });
    const renderFooter = () => {
      if (slots.footer) {
        return slots.footer();
      }
      return props.theme === "round-button" ? renderRoundButtons() : renderButtons();
    };
    return () => {
      const {
        width,
        title,
        theme,
        message,
        className
      } = props;
      return createVNode(Popup, mergeProps({
        "ref": root,
        "role": "dialog",
        "class": [bem([theme]), className],
        "style": {
          width: addUnit(width)
        },
        "tabindex": 0,
        "aria-labelledby": title || message,
        "onKeydown": onKeydown,
        "onUpdate:show": updateShow
      }, pick(props, popupInheritKeys)), {
        default: () => [renderTitle(), renderContent(), renderFooter()]
      });
    };
  }
});
let instance;
const DEFAULT_OPTIONS = {
  title: "",
  width: "",
  theme: null,
  message: "",
  overlay: true,
  callback: null,
  teleport: "body",
  className: "",
  allowHtml: false,
  lockScroll: true,
  transition: void 0,
  beforeClose: null,
  overlayClass: "",
  overlayStyle: void 0,
  messageAlign: "",
  cancelButtonText: "",
  cancelButtonColor: null,
  cancelButtonDisabled: false,
  confirmButtonText: "",
  confirmButtonColor: null,
  confirmButtonDisabled: false,
  showConfirmButton: true,
  showCancelButton: false,
  closeOnPopstate: true,
  closeOnClickOverlay: false
};
let currentOptions = extend({}, DEFAULT_OPTIONS);
function initInstance() {
  const Wrapper = {
    setup() {
      const {
        state,
        toggle
      } = usePopupState();
      return () => createVNode(stdin_default, mergeProps(state, {
        "onUpdate:show": toggle
      }), null);
    }
  };
  ({
    instance
  } = mountComponent(Wrapper));
}
function showDialog(options) {
  if (!inBrowser) {
    return Promise.resolve(void 0);
  }
  return new Promise((resolve, reject) => {
    if (!instance) {
      initInstance();
    }
    instance.open(extend({}, currentOptions, options, {
      callback: (action) => {
        (action === "confirm" ? resolve : reject)(action);
      }
    }));
  });
}
const Dialog = withInstall(stdin_default);
const useUserStore = defineStore("user", () => {
  function logout() {
    Storage.remove("isLogin");
  }
  return {
    logout
  };
});
const _hoisted_1 = { class: "pl-20 pr-20 pt-20 pb-50" };
const _hoisted_2 = { class: "flex-row items-center header" };
const _hoisted_3 = ["onClick"];
const _hoisted_4 = { class: "file-box" };
const _hoisted_5 = { class: "flex-row items-center" };
const _hoisted_6 = { class: "flex-row items-center flex-1" };
const _hoisted_7 = { class: "flex-row items-center flex-1" };
const _hoisted_8 = { class: "file-box" };
const _hoisted_9 = { class: "flex-row items-center" };
const _hoisted_10 = { class: "flex-row items-center flex-1" };
const _hoisted_11 = { class: "flex-row items-center flex-1" };
const _hoisted_12 = { class: "file-box modify-box" };
const _hoisted_13 = { class: "flex-row items-center title" };
const _hoisted_14 = { class: "flex-row items-center mt-15 mb-10 select" };
const _hoisted_15 = { class: "select-list active" };
const _hoisted_16 = { class: "flex-row justify-center items-center submit-btns" };
const _hoisted_17 = { class: "ml-20 mr-20 mt-30 mb-30" };
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const userStore = useUserStore();
    const router = useRouter();
    const overallShow = ref(false);
    const overallIndex = ref(0);
    const overallType = ref("");
    const fileNameList = ref([]);
    readFromHeader();
    async function readFromHeader() {
      const result = await window.electron.readFile("headers");
      if (result.success) {
        fileNameList.value = result.data?.headers;
        readFromFile();
      }
    }
    async function readFromFile() {
      const result = await window.electron.readFile(fileNameList.value[overallIndex.value]);
      if (result.success) {
        const data = result.data;
        sourceFile.value = data.sourceFile;
        targetFile.value = data.targetFile;
        sourceFolder.value = data.sourceFolder;
        targetFolder.value = data.targetFolder;
        data.modifyList.forEach((item) => {
          item.json = item.json.filter((json) => json.key && json.value);
        });
        let isSave = data.modifyList.filter((item) => item.json.length === 0);
        if (isSave.length > 0) {
          window.electron.saveFile(JSON.stringify(data));
        }
        data.modifyList = data.modifyList.filter((item) => item.json.length > 0);
        modifyList.value = data.modifyList || [];
      }
    }
    function selectFileName(index2) {
      overallIndex.value = index2;
      readFromFile();
    }
    const fileNameModify = ref("");
    function openFileName(type, index2) {
      overallType.value = type;
      overallShow.value = true;
      if (type === "add") {
        fileNameModify.value = "";
      } else if (type === "edit") {
        overallIndex.value = index2;
        fileNameModify.value = fileNameList.value[overallIndex.value];
      }
    }
    function confirmFileName() {
      if (!fileNameModify.value) {
        showToast({
          message: "请填写配置名",
          duration: 1e3
        });
        return false;
      }
      const isExist = fileNameList.value.some((item) => item === fileNameModify.value);
      if (isExist) {
        showToast({
          message: "配置名已存在",
          duration: 1e3
        });
        return false;
      }
      if (overallType.value === "add") {
        fileNameList.value.push(fileNameModify.value);
        overallIndex.value = fileNameList.value.length - 1;
        const data = {
          fileName: fileNameModify.value,
          sourceFile: "",
          targetFile: "",
          sourceFolder: "",
          targetFolder: "",
          modifyList: []
        };
        window.electron.saveFile(JSON.stringify(data));
        readFromFile();
      } else if (overallType.value === "edit") {
        window.electron.renameFile(fileNameList.value[overallIndex.value], fileNameModify.value);
        fileNameList.value[overallIndex.value] = fileNameModify.value;
      }
      window.electron.saveFile(JSON.stringify({ "fileName": "headers", "headers": fileNameList.value }));
    }
    function removeFileName(index2) {
      overallIndex.value = index2;
      showDialog({
        title: "提示",
        message: "确认删除 " + fileNameList.value[overallIndex.value] + " 配置吗?",
        showCancelButton: true
      }).then(() => {
        if (fileNameList.value.length === 1) {
          showToast({
            message: "至少保留一个配置!",
            duration: 1e3
          });
          return false;
        }
        window.electron.deleteFile(fileNameList.value[overallIndex.value]);
        fileNameList.value.splice(index2, 1);
        window.electron.saveFile(JSON.stringify({ "fileName": "headers", "headers": fileNameList.value }));
        overallIndex.value = fileNameList.value.length - 1;
        readFromFile();
      });
    }
    const sourceFile = ref("");
    const targetFile = ref("");
    async function openFile(who) {
      const paths = await window.electron.openFileDialog();
      if (paths.length > 0) {
        who === "new" ? sourceFile.value = paths[0] : targetFile.value = paths[0];
        saveToFile();
      }
    }
    const sourceFolder = ref("");
    const targetFolder = ref("");
    async function openFolder(who) {
      const paths = await window.electron.openFolderDialog();
      if (paths.length > 0) {
        who === "new" ? sourceFolder.value = paths[0] : targetFolder.value = paths[0];
        saveToFile();
      }
    }
    const modifyList = ref([]);
    const modifyListIndex = ref(0);
    async function openFileModify() {
      const paths = await window.electron.openFileDialog();
      if (paths.length > 0) {
        if (modifyList.value.some((item) => item.filePath === paths[0])) {
          showToast({
            message: "文件已存在",
            duration: 1e3
          });
          return false;
        }
        modifyList.value.push({
          id: modifyList.value.length,
          filePath: paths[0],
          name: paths[0].split("/").slice(-2).join("/"),
          json: [
            { id: 0, key: "", value: "" }
          ]
        });
        modifyListIndex.value = modifyList.value.length - 1;
        saveToFile();
      }
    }
    function removeFileList(index2) {
      console.log();
      showDialog({
        title: "提示",
        message: "确认删除 " + modifyList.value[index2]?.name + " 吗?",
        showCancelButton: true
      }).then(() => {
        modifyList.value.splice(index2, 1);
        saveToFile();
      });
    }
    let debounce = true;
    function addJsonField(index2) {
      if (!debounce) {
        showToast({
          message: "请勿频繁点击",
          duration: 1e3
        });
        return false;
      }
      debounce = false;
      setTimeout(() => {
        debounce = true;
      }, 2e3);
      modifyList.value[index2].json.push({
        id: modifyList.value[index2].json.length,
        key: "",
        value: ""
      });
      saveToFile();
    }
    function removeJsonField(index2, indexC) {
      showDialog({
        title: "提示",
        message: "确认删除吗?",
        showCancelButton: true
      }).then(() => {
        modifyList.value[index2].json.splice(indexC, 1);
        saveToFile();
      });
    }
    async function saveToFile() {
      const data = {
        fileName: fileNameList.value[overallIndex.value],
        sourceFile: sourceFile.value,
        targetFile: targetFile.value,
        sourceFolder: sourceFolder.value,
        targetFolder: targetFolder.value,
        modifyList: modifyList.value
      };
      window.electron.saveFile(JSON.stringify(data));
    }
    async function saveFileConfig() {
      const result = await window.electron.readFile("config", window.electron.getDirname("../renderer/lib/build"));
      if (result.success) {
        if (!result.data[fileNameList.value[overallIndex.value]]) {
          result.data[fileNameList.value[overallIndex.value]] = {};
        }
        result.data[fileNameList.value[overallIndex.value]].sourceFile = sourceFile.value;
        result.data[fileNameList.value[overallIndex.value]].targetFile = targetFile.value;
        result.data[fileNameList.value[overallIndex.value]].sourceFolder = sourceFolder.value;
        result.data[fileNameList.value[overallIndex.value]].targetFolder = targetFolder.value;
        result.data[fileNameList.value[overallIndex.value]].modifyList = [];
        for (const item of modifyList.value) {
          let saveJson = {
            filePath: item.filePath
          };
          const isEmpty = item.json.some((json) => json.key === "" || json.value === "");
          if (isEmpty) {
            showToast({
              message: "字段名和值不能为空, 请检查数据后再试",
              duration: 1e3
            });
            return false;
          }
          for (const itemC of item.json) {
            saveJson[itemC.key] = itemC.value;
          }
          result.data[fileNameList.value[overallIndex.value]].modifyList.push(saveJson);
        }
        for (const key in result.data) {
          if (key !== "fileName") {
            let keyExist = fileNameList.value.some((item) => item === key);
            if (!keyExist) {
              delete result.data[key];
            }
          }
        }
        window.electron.saveFile(JSON.stringify(result.data), window.electron.getDirname("../renderer/lib/build"));
        await window.electron.executeReplace("", fileNameList.value[overallIndex.value]);
        showDialog({
          title: "提示",
          message: "执行完成",
          showCancelButton: false,
          theme: "round-button"
        });
      }
    }
    async function uploadFolder() {
      const result = await window.electron.openFolderDialog();
      if (result.length > 0) {
        const folderResult = await window.electron.uploadFolder(result[0]);
        console.log(folderResult);
        if (folderResult.success) {
          readFromHeader();
          readFromFile();
          showDialog({
            title: "提示",
            message: "上传完成",
            showCancelButton: false,
            theme: "round-button"
          });
        }
      }
    }
    async function exportFolder() {
      let result = await window.electron.openFolderDialog();
      console.log(result);
      if (result.length > 0) {
        await window.electron.exportFolder("", result[0], "lazy-build-config");
        showDialog({
          title: "提示",
          message: "导出完成",
          showCancelButton: false,
          theme: "round-button"
        });
      }
    }
    function submit() {
      saveFileConfig();
    }
    function logout() {
      showDialog({
        title: "提示",
        message: "确认退出吗?",
        showCancelButton: true
      }).then(() => {
        userStore.logout();
        router.push("/login");
      });
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("section", _hoisted_1, [
        createBaseVNode("nav", _hoisted_2, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(fileNameList.value, (item, index2) => {
            return openBlock(), createElementBlock("section", {
              class: normalizeClass(["flex-row items-center justify-center nav", { active: overallIndex.value === index2 }]),
              onClick: ($event) => selectFileName(index2),
              key: index2
            }, [
              createTextVNode(toDisplayString(item) + " ", 1),
              createVNode(unref(Icon), {
                name: "edit",
                size: "18",
                class: "ml-30",
                onClick: ($event) => openFileName("edit", index2)
              }, null, 8, ["onClick"]),
              createVNode(unref(Icon), {
                name: "close",
                size: "18",
                class: "ml-5",
                color: "red",
                onClick: ($event) => removeFileName(index2)
              }, null, 8, ["onClick"])
            ], 10, _hoisted_3);
          }), 128)),
          createBaseVNode("section", {
            onClick: exportFolder,
            class: "upload-folder"
          }, "导出配置"),
          createBaseVNode("section", {
            onClick: uploadFolder,
            class: "upload-folder"
          }, "上传配置"),
          createVNode(unref(Icon), {
            name: "add-o",
            size: "24",
            color: "#4187F2",
            class: "cursor",
            onClick: _cache[0] || (_cache[0] = ($event) => openFileName("add"))
          })
        ]),
        createBaseVNode("section", _hoisted_4, [
          _cache[13] || (_cache[13] = createBaseVNode("section", { class: "title" }, [
            createTextVNode("替换文件"),
            createBaseVNode("span", { class: "c-gray sub" }, " (文件内容替换, 文件名不会替换, 如无填空)")
          ], -1)),
          createBaseVNode("section", _hoisted_5, [
            createBaseVNode("section", _hoisted_6, [
              createVNode(unref(Field), {
                modelValue: sourceFile.value,
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => sourceFile.value = $event),
                placeholder: "请填写 或 选择新文件地址",
                onChange: saveToFile
              }, null, 8, ["modelValue"]),
              createVNode(unref(Button), {
                type: "primary",
                plain: "",
                onClick: _cache[2] || (_cache[2] = ($event) => openFile("new")),
                class: "button"
              }, {
                default: withCtx(() => _cache[11] || (_cache[11] = [
                  createTextVNode("选择新文件")
                ])),
                _: 1
              })
            ]),
            createBaseVNode("section", _hoisted_7, [
              createVNode(unref(Field), {
                modelValue: targetFile.value,
                "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => targetFile.value = $event),
                placeholder: "请填写 或 选择旧文件地址",
                onChange: saveToFile
              }, null, 8, ["modelValue"]),
              createVNode(unref(Button), {
                type: "primary",
                plain: "",
                onClick: _cache[4] || (_cache[4] = ($event) => openFile("old")),
                class: "button"
              }, {
                default: withCtx(() => _cache[12] || (_cache[12] = [
                  createTextVNode("选择旧文件")
                ])),
                _: 1
              })
            ])
          ])
        ]),
        createBaseVNode("section", _hoisted_8, [
          _cache[16] || (_cache[16] = createBaseVNode("section", { class: "title" }, [
            createTextVNode("替换文件夹"),
            createBaseVNode("span", { class: "c-gray sub" }, " (整个文件夹替换, 文件夹名不会替换, 如无填空)")
          ], -1)),
          createBaseVNode("section", _hoisted_9, [
            createBaseVNode("section", _hoisted_10, [
              createVNode(unref(Field), {
                modelValue: sourceFolder.value,
                "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => sourceFolder.value = $event),
                placeholder: "请填写 或 选择新文件夹地址",
                onChange: saveToFile
              }, null, 8, ["modelValue"]),
              createVNode(unref(Button), {
                type: "primary",
                plain: "",
                onClick: _cache[6] || (_cache[6] = ($event) => openFolder("new")),
                class: "button"
              }, {
                default: withCtx(() => _cache[14] || (_cache[14] = [
                  createTextVNode("新文件夹")
                ])),
                _: 1
              })
            ]),
            createBaseVNode("section", _hoisted_11, [
              createVNode(unref(Field), {
                modelValue: targetFolder.value,
                "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => targetFolder.value = $event),
                placeholder: "请填写 或 选择旧文件夹地址",
                onChange: saveToFile
              }, null, 8, ["modelValue"]),
              createVNode(unref(Button), {
                type: "primary",
                plain: "",
                onClick: _cache[8] || (_cache[8] = ($event) => openFolder("old")),
                class: "button"
              }, {
                default: withCtx(() => _cache[15] || (_cache[15] = [
                  createTextVNode("旧文件夹")
                ])),
                _: 1
              })
            ])
          ])
        ]),
        createBaseVNode("section", _hoisted_12, [
          createBaseVNode("section", _hoisted_13, [
            _cache[17] || (_cache[17] = createTextVNode(" 修改文件 ")),
            createVNode(unref(Icon), {
              name: "add-o",
              size: "24",
              color: "#4187F2",
              class: "cursor ml-10",
              onClick: openFileModify
            }),
            _cache[18] || (_cache[18] = createBaseVNode("span", { class: "c-gray ml-10 sub" }, ' (修改文件内某些字段, 如无清除json字段, 只能修改包含且支持js语法文件里的 "aaa"="111" 或者"aaa":"111"这样的格式)', -1))
          ]),
          (openBlock(true), createElementBlock(Fragment, null, renderList(modifyList.value, (item, index2) => {
            return openBlock(), createElementBlock("section", {
              key: item.id
            }, [
              createBaseVNode("section", _hoisted_14, [
                createBaseVNode("nav", _hoisted_15, toDisplayString(item.name), 1),
                createVNode(unref(Icon), {
                  name: "add-o",
                  size: "24",
                  color: "#4187F2",
                  class: "cursor ml-10",
                  onClick: ($event) => addJsonField(index2)
                }, null, 8, ["onClick"]),
                createVNode(unref(Icon), {
                  name: "close",
                  size: "24",
                  color: "red",
                  class: "ml-10 cursor",
                  onClick: ($event) => removeFileList(index2)
                }, null, 8, ["onClick"])
              ]),
              (openBlock(true), createElementBlock(Fragment, null, renderList(item.json, (itemC, indexC) => {
                return openBlock(), createElementBlock("section", {
                  class: "flex-row items-center pb-10",
                  key: item.id
                }, [
                  createVNode(unref(Field), {
                    modelValue: itemC.key,
                    "onUpdate:modelValue": ($event) => itemC.key = $event,
                    label: "字段名:",
                    "label-width": "50",
                    placeholder: "请填写json字段名",
                    class: "flex-1 input",
                    onChange: saveToFile
                  }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                  createVNode(unref(Field), {
                    modelValue: itemC.value,
                    "onUpdate:modelValue": ($event) => itemC.value = $event,
                    label: "值:",
                    "label-width": "20",
                    placeholder: "请填写json值",
                    class: "flex-1 input",
                    onChange: saveToFile
                  }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                  createVNode(unref(Button), {
                    type: "danger",
                    plain: "",
                    size: "small",
                    class: "ml-10",
                    onClick: ($event) => removeJsonField(index2, indexC)
                  }, {
                    default: withCtx(() => _cache[19] || (_cache[19] = [
                      createTextVNode("删除")
                    ])),
                    _: 2
                  }, 1032, ["onClick"])
                ]);
              }), 128))
            ]);
          }), 128))
        ]),
        createBaseVNode("section", _hoisted_16, [
          createVNode(unref(Button), {
            type: "primary",
            onClick: submit,
            class: "submit"
          }, {
            default: withCtx(() => _cache[20] || (_cache[20] = [
              createTextVNode("立即执行")
            ])),
            _: 1
          }),
          createVNode(unref(Button), {
            plain: "",
            onClick: logout,
            class: "logout"
          }, {
            default: withCtx(() => _cache[21] || (_cache[21] = [
              createTextVNode("退出")
            ])),
            _: 1
          })
        ]),
        createVNode(unref(Dialog), {
          show: overallShow.value,
          "onUpdate:show": _cache[10] || (_cache[10] = ($event) => overallShow.value = $event),
          title: "增加配置",
          "show-cancel-button": "",
          onConfirm: confirmFileName,
          class: "dialog",
          confirmButtonColor: "#4187F2",
          cancelButtonColor: "#cccccc",
          theme: "round-button"
        }, {
          default: withCtx(() => [
            createBaseVNode("section", _hoisted_17, [
              createVNode(unref(Field), {
                modelValue: fileNameModify.value,
                "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => fileNameModify.value = $event),
                label: "填写配置名:",
                "label-width": "80",
                placeholder: "请填写配置名",
                class: "input"
              }, null, 8, ["modelValue"])
            ])
          ]),
          _: 1
        }, 8, ["show"])
      ]);
    };
  }
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-8a8682c8"]]);
export {
  index as default
};
