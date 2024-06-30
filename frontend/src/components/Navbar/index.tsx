/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
import { useAuth0 } from "@auth0/auth0-react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  BellIcon,
  CircleStackIcon,
  LockOpenIcon,
  MoonIcon,
  NewspaperIcon,
  SunIcon,
  SwatchIcon,
  UserGroupIcon,
  UsersIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Fragment, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Link, useLocation, useNavigate } from "react-router-dom";

export const classNames = (...classes: any) => {
  return classes.filter(Boolean).join(" ");
};

export const navigation = [
  {
    id: 1,
    name: "Dashboard",
    href: "/",
    current: false,
    icon: (item: any, w: number = 6, h: number = 6) => (
      <NewspaperIcon
        className={classNames(
          item.current
            ? "text-white"
            : "text-gray-400 group-hover:text-gray-300",
          `mr-2 h-${h} w-${w}`
        )}
        aria-hidden="true"
      />
    ),
  },
  {
    id: 2,
    name: "Categories",
    href: "/categories",
    current: false,
    icon: (item: any, w: number = 6, h: number = 6) => (
      <SwatchIcon
        className={classNames(
          item.current
            ? "text-white"
            : "text-gray-400 group-hover:text-gray-300",
          `mr-2 h-${h} w-${w}`
        )}
        aria-hidden="true"
      />
    ),
  },
  {
    id: 3,
    name: "Records",
    href: "/records",
    current: false,
    icon: (item: any, w: number = 6, h: number = 6) => (
      <CircleStackIcon
        className={classNames(
          item.current
            ? "text-white"
            : "text-gray-400 group-hover:text-gray-300",
          `mr-2 h-${h} w-${w}`
        )}
        aria-hidden="true"
      />
    ),
  },
];

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cookies, setCookie] = useCookies(["dark-mode"]);
  const [isDarkMode, setIsDarkMode] = useState(cookies["dark-mode"]);
  const {
    loginWithRedirect,
    logout,
    user: authUser,
    isAuthenticated,
  } = useAuth0();

  const user = {
    imageUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  };

  const userNavigation = [
    {
      name: "Profile",
      href: "/user/profile",
      icon: <UserGroupIcon className="w-6 h-6" aria-hidden="true" />,
    },
    {
      name: "Settings",
      href: "#",
      icon: <WrenchScrewdriverIcon className="w-6 h-6" aria-hidden="true" />,
    },
    {
      name: "Sign out",
      href: "#",
      icon: <LockOpenIcon className="w-6 h-6" aria-hidden="true" />,
    },
  ];

  const [menuItemCurr, setMenuItemCurr] = useState(navigation);

  // const handleDarkMode = () => {
  //   setIsDarkMode((isDarkMode: boolean) => !isDarkMode);
  //   setCookie("dark-mode", !isDarkMode, {
  //     expires: new Date(new Date().setMinutes(new Date().getMinutes() + 5)),
  //   });
  // };

  // #handleLogin
  const handleLogin = () => {
    navigate('/signup');
  }

  useEffect(() => {
    isDarkMode
      ? document.body.classList.add("dark")
      : document.body.classList.remove("dark");

    // Set current active menu item
    let idx = navigation.findIndex((item) => {
      return item.href === location.pathname;
    });

    if (idx === -1) {
      idx = navigation.findIndex((item) => {
        return item.href === `/${location.pathname.split("/")[1]}`;
      });
    }

    setMenuItemCurr(
      menuItemCurr.map((item) => {
        return {
          ...item,
          current: item.id === idx + 1,
        };
      })
    );
    return () => {};
  }, [isDarkMode]);

  return (
    <div className="min-h-full">
      <Disclosure as="nav" className="bg-gray-800">
        {({ open }) => (
          <>
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <img
                      className="w-8 h-8"
                      src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                      alt="KeePass"
                    />
                  </div>
                  <div className="hidden md:block">
                    <div className="flex items-baseline ml-10 space-x-4">
                      {menuItemCurr.map((item, index: number) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={classNames(
                            item.current
                              ? "bg-gray-900 text-white"
                              : "text-gray-300 hover:bg-gray-700 hover:text-white",
                            "rounded-md px-3 py-2 text-sm font-medium flex items-center space-x-0"
                          )}
                          aria-current={item.current ? "page" : undefined}
                          onClick={() => {
                            setMenuItemCurr(
                              menuItemCurr.map((item) => {
                                return {
                                  ...item,
                                  current: item.id === index + 1 ? true : false,
                                };
                              })
                            );
                          }}
                        >
                          {item.icon(item)}
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="flex items-center ml-4 space-x-2 md:ml-6">
                    {isDarkMode && (
                      <MoonIcon
                        className="w-6 h-6 text-gray-400"
                        aria-hidden="true"
                      />
                    )}

                    {/* {!isDarkMode && (
                      <SunIcon
                        className="w-6 h-6 text-gray-400"
                        aria-hidden="true"
                      />
                    )} */}

                    {/* <div className="rounded">
                      <form>
                        <label htmlFor="darkMode">
                          <input
                            id="darkMode"
                            name="darkMode"
                            type="checkbox"
                            value={isDarkMode}
                            onChange={handleDarkMode}
                            checked={isDarkMode}
                          />
                        </label>
                      </form>
                    </div> */}

                    {/* <button
                      type="button"
                      className="relative p-1 text-gray-400 bg-gray-800 rounded-full hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                    >
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">View notifications</span>
                      <BellIcon className="w-6 h-6" aria-hidden="true" />
                    </button> */}

                    {/* Login */}
                    {!isAuthenticated && (
                      <button
                        type="button"
                        className="relative flex p-1 text-gray-400 bg-gray-800 rounded-full hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                        onClick={() => handleLogin()}
                      >
                        <UsersIcon
                          className="w-6 h-6 mr-2"
                          aria-hidden="true"
                        />
                        ログイン
                      </button>
                    )}

                    {/* Profile dropdown */}
                    {isAuthenticated && (
                      <Menu as="div" className="relative ml-0">
                        <div>
                          <Menu.Button className="relative flex items-center max-w-xs text-sm bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                            <span className="absolute -inset-1.5" />
                            <span className="sr-only">Open user menu</span>
                            <img
                              className="w-8 h-8 rounded-full"
                              src={authUser?.picture}
                              alt="logged in user avatar"
                            />
                          </Menu.Button>
                        </div>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 z-10 w-48 py-1 mt-2 origin-top-right bg-white rounded-md shadow-lg dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none ">
                            {userNavigation.map((item) => (
                              <Menu.Item key={item.name}>
                                {({ active }) => (
                                  <div className="flex justify-items-center">
                                    <Link
                                      to={item.href}
                                      className={classNames(
                                        active ? "dark:hover:bg-gray-600" : "",
                                        "flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-300 dark:text-gray-400 dark:hover:bg-gray-600"
                                      )}
                                      onClick={() => {
                                        // console.log("item", item);
                                        if (item.name === "Sign out") {
                                          logout({
                                            logoutParams: {
                                              returnTo: window.location.origin,
                                            },
                                          });
                                        }
                                      }}
                                    >
                                      <span className="mr-2">{item.icon}</span>
                                      {item.name}
                                    </Link>
                                  </div>
                                )}
                              </Menu.Item>
                            ))}
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    )}
                  </div>
                </div>
                <div className="flex -mr-2 md:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button className="relative inline-flex items-center justify-center p-2 text-gray-400 bg-gray-800 rounded-md hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                    <span className="absolute -inset-0.5" />
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block w-6 h-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block w-6 h-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

          </>
        )}
      </Disclosure>

      {/* {isAuthenticated && (
        <code className="block p-3 mt-2 ml-6 mr-6 overflow-auto text-sm shadow-md dark:text-gray-400">
          <pre>{JSON.stringify(authUser, null, 2)}</pre>
        </code>
      )} */}
    </div>
  );
}

export default NavBar;
