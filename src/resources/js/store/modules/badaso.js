import api from "../../api";
import createPersistedState from "vuex-persistedstate";
import helpers from "../../utils/helper";
import lang from "../../lang";

export default {
  namespaced: true,
  state: {
    isSidebarActive: false,
    reduceSidebar: false,
    themeColor: "#2962ff",
    menu: [],
    configurationMenu: {},
    componentList: [],
    groupList: [],
    config: {},
    user: {
      avatar: 'files/shares/default-user.png'
    },
    locale: lang.languages,
    selectedLocale: {
      key: "en",
      label: "English",
    },
    keyIssue: {
      invalid: false,
    },
    authorizationIssue: {
      unauthorized: false,
    },
    verified: false,
    isOnline: false,
    countUnreadMessage: 0,
    meta: {}
  },
  mutations: {
    //This is for Sidbar trigger in mobile
    IS_SIDEBAR_ACTIVE(state, value) {
      state.isSidebarActive = value;
    },
    REDUCE_SIDEBAR(state, value) {
      state.reduceSidebar = value;
    },
    FETCH_MENU(state) {
      const menuKey = process.env.MIX_BADASO_MENU
        ? process.env.MIX_BADASO_MENU
        : "admin";
      const prefix = process.env.MIX_ADMIN_PANEL_ROUTE_PREFIX
        ? process.env.MIX_ADMIN_PANEL_ROUTE_PREFIX
        : "badaso-dashboard";
      api.badasoMenu
        .browseItemByKeys({
          menu_key: menuKey,
        })
        .then((res) => {
          var menus = [];
          for (let index = 0; index < res.data.length; index++) {
            let menu = res.data[index].menu;
            let items = res.data[index].menuItems;
            if (menu.key === "admin") {
              items.map((item) => {
                if (helpers.isValidHttpUrl(item.url)) {
                  item.url = item.url;
                } else {
                  item.url = "/" + prefix + "" + item.url;
                }

                if (item.children && item.children.length > 0) {
                  item.children.map((subItem) => {
                    if (helpers.isValidHttpUrl(subItem.url)) {
                      subItem.url = subItem.url;
                    } else {
                      subItem.url = "/" + prefix + "" + subItem.url;
                    }
                    return subItem;
                  });
                }

                return item;
              });
            } else {
              items.map((item) => {
                if (helpers.isValidHttpUrl(item.url)) {
                  item.url = item.url;
                } else {
                  item.url = "/" + prefix + "" + item.url;
                }

                if (item.children && item.children.length > 0) {
                  item.children.map((subItem) => {
                    if (helpers.isValidHttpUrl(subItem.url)) {
                      subItem.url = subItem.url;
                    } else {
                      subItem.url = "/" + prefix + "" + subItem.url;
                    }
                    return subItem;
                  });
                }

                return item;
              });
            }
            menus.push({
              menu: res.data[index].menu,
              mainMenu: items,
            });
          }
          state.menu = menus;
          state.meta = res.meta
        })
        .catch((err) => {});
    },
    FETCH_CONFIGURATION_MENU(state) {
      const prefix = process.env.MIX_ADMIN_PANEL_ROUTE_PREFIX
        ? process.env.MIX_ADMIN_PANEL_ROUTE_PREFIX
        : "badaso-dashboard";
      api.badasoMenu
        .browseItemByKey({
          menu_key: "configuration",
        })
        .then((res) => {
          let menuItems = res.data.menuItems;
          menuItems.map((item) => {
            if (helpers.isValidHttpUrl(item.url)) {
              item.url = item.url;
            } else {
              item.url = "/" + prefix + "" + item.url;
            }

            if (item.children && item.children.length > 0) {
              item.children.map((subItem) => {
                if (helpers.isValidHttpUrl(subItem.url)) {
                  subItem.url = subItem.url;
                } else {
                  subItem.url = "/" + prefix + "" + subItem.url;
                }
                return subItem;
              });
            }
            return item;
          });
          state.configurationMenu = {
            menu: res.data.menu,
            menuItems: menuItems,
          };
          state.meta = res.meta
        })
        .catch((err) => {});
    },
    FETCH_COMPONENT(state) {
      api.badasoData
        .component()
        .then((res) => {
          state.componentList = res.data.components;
          state.meta = res.meta
        })
        .catch((err) => {});
    },
    FETCH_CONFIGURATION_GROUPS(state) {
      api.badasoData
        .configurationGroups()
        .then((res) => {
          state.groupList = res.data.groups;
          state.meta = res.meta
        })
        .catch((err) => {});
    },
    FETCH_CONFIGURATION(state) {
      api.badasoConfiguration
        .applyable()
        .then((res) => {
          state.meta = res.meta
          state.config = res.data.configuration;
        })
        .catch((err) => {});
    },
    FETCH_USER(state) {
      api.badasoAuthUser
        .user()
        .then((res) => {
          state.user = res.data.user;
          state.meta = res.meta
        })
        .catch((err) => {});
    },
    SET_LOCALE(state, value) {
      state.selectedLocale = value;
    },
    SET_KEY_ISSUE(state, value) {
      state.keyIssue = value;
    },
    SET_AUTH_ISSUE(state, value) {
      state.authorizationIssue = value;
    },
    LOGOUT(state) {
      localStorage.clear();
      window.location.reload();
    },
    VERIFY_BADASO(state) {
      api.badaso
        .verify()
        .then((res) => {
          state.verified = true;
          state.meta = res.meta
        })
        .catch((err) => {
          if (err.status) {
            if (err.status == 402 || err.status == 400) {
              state.keyIssue = {
                ...err,
                invalid: true,
              };
            }
          }
          state.verified = true;
        });
    },
    SET_GLOBAL_STATE(state, { key, value }) {
      state[key] = value;
    },
    SET_META(state, meta) {
      state.meta = meta
    }
  },
  actions: {},
  getters: {
    getMenu: (state) => {
      return state.menu;
    },
    getConfigurationMenu: (state) => {
      return state.configurationMenu;
    },
    getComponent: (state) => {
      return state.componentList;
    },
    getSiteGroup: (state) => {
      return state.groupList;
    },
    getConfig: (state) => {
      return state.config;
    },
    getMeta: (state) => {
      return state.meta;
    },
    getUser: (state) => {
      return state.user;
    },
    getLocale: (state) => {
      return state.locale;
    },
    getSelectedLocale: (state) => {
      return state.selectedLocale;
    },
    isVerified: (state) => {
      return state.verified;
    },
    getGlobalState: (state) => {
      return state;
    },
  },
  plugins: [createPersistedState()],
};
