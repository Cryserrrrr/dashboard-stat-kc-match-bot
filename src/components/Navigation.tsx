import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Users,
  Command,
  Ticket,
  Menu,
  X,
  Home,
  Server,
  Calendar,
  LogOut,
  User,
  FileText,
  ChevronDown,
  ChevronUp,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "../utils/cn";
import { useAuth } from "../contexts/AuthContext";
import { useDarkMode } from "../contexts/DarkModeContext";

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeSection = location.pathname.split("/")[1] || "dashboard";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const directItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "matches", label: "Matches", icon: Calendar },
  ];

  const navigationGroups = [
    {
      id: "management",
      label: "Gestion",
      items: [
        { id: "servers", label: "Servers", icon: Server },
        { id: "commands", label: "Commands", icon: Command },
        { id: "users", label: "Users", icon: Users },
      ],
    },
    {
      id: "support",
      label: "Support",
      items: [
        { id: "tickets", label: "Tickets", icon: Ticket },
        { id: "changelog", label: "Changelog", icon: FileText },
      ],
    },
  ];

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(
      (prev) =>
        prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [groupId] // Only keep the current group open
    );
  };

  const isGroupExpanded = (groupId: string) => expandedGroups.includes(groupId);

  return (
    <nav className="bg-white dark:bg-brand-card shadow-lg border-b-2 border-brand-light/20 dark:border-0 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-black dark:text-white">
                Kc Bot Dashboard
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            {/* Direct Access Items */}
            {directItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(`/${item.id}`)}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 border-2",
                    activeSection === item.id
                      ? "bg-brand-light text-white border-brand-light shadow-md transform scale-105"
                      : "text-gray-700 dark:text-gray-300 hover:text-brand-light dark:hover:text-white hover:bg-brand-light/10 dark:hover:bg-gray-600 border-transparent hover:border-brand-light/30 dark:hover:border-gray-500"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 mr-2",
                      activeSection === item.id
                        ? "text-white"
                        : "text-gray-600 dark:text-gray-400"
                    )}
                  />
                  {item.label}
                </button>
              );
            })}

            {/* Separator */}
            <div className="w-px h-8 bg-gray-300 dark:bg-gray-500 mx-4"></div>

            {/* Dropdown Groups */}
            {navigationGroups.map((group) => (
              <div key={group.id} className="relative">
                <button
                  onClick={() => toggleGroup(group.id)}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 border-2",
                    isGroupExpanded(group.id)
                      ? "bg-brand-light text-white border-brand-light shadow-md"
                      : "text-gray-700 dark:text-gray-300 hover:text-brand-light dark:hover:text-white hover:bg-brand-light/10 dark:hover:bg-gray-600 border-transparent hover:border-brand-light/30 dark:hover:border-gray-500"
                  )}
                >
                  <span>{group.label}</span>
                  {isGroupExpanded(group.id) ? (
                    <ChevronUp className="h-4 w-4 ml-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-2" />
                  )}
                </button>

                {/* Dropdown Menu */}
                {isGroupExpanded(group.id) && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-brand-card rounded-lg shadow-lg border border-gray-200 dark:border-0 z-50 animate-slide-down">
                    <div className="py-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              navigate(`/${item.id}`);
                              setExpandedGroups([]);
                            }}
                            className={cn(
                              "flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-brand-light/10 dark:hover:bg-gray-600 hover:text-brand-light dark:hover:text-white transition-colors",
                              activeSection === item.id &&
                                "bg-brand-light/10 dark:bg-gray-600 text-brand-light dark:text-white"
                            )}
                          >
                            <Icon className="h-4 w-4 mr-3" />
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="flex items-center px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 border-2 text-gray-700 dark:text-gray-300 hover:text-brand-light dark:hover:text-white hover:bg-brand-light/10 dark:hover:bg-gray-600 border-transparent hover:border-brand-light/30 dark:hover:border-gray-500"
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            {/* User Menu */}
            <div className="flex items-center space-x-3 ml-6 pl-6 border-l-2 border-gray-200 dark:border-gray-500">
              <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-600 px-3 py-1.5 rounded-lg">
                <div className="h-8 w-8 bg-gradient-to-br from-brand-light to-brand-light/80 rounded-full flex items-center justify-center shadow-md">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-800 dark:text-white">
                    {user?.username}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Admin
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center px-3 py-1.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 border-2 border-red-200 dark:border-red-800 hover:border-red-600"
              >
                <LogOut className="h-4 w-4 mr-1.5" />
                Logout
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-3">
            {/* Dark Mode Toggle for Mobile */}
            <button
              onClick={toggleDarkMode}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 dark:text-brand-400 hover:text-brand-600 dark:hover:text-brand-200 hover:bg-brand-50 dark:hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-all duration-200"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 dark:text-brand-400 hover:text-brand-600 dark:hover:text-brand-200 hover:bg-brand-50 dark:hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-all duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-brand-800 border-t-2 border-brand-200 dark:border-brand-600 shadow-lg animate-slide-down">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {/* Direct Access Items */}
            {directItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(`/${item.id}`);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "flex items-center w-full px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 border-2",
                    activeSection === item.id
                      ? "bg-brand-600 text-white border-brand-600 shadow-md"
                      : "text-gray-700 dark:text-brand-300 hover:text-brand-600 dark:hover:text-brand-200 hover:bg-brand-50 dark:hover:bg-brand-700 border-transparent hover:border-brand-200 dark:hover:border-brand-500"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 mr-3",
                      activeSection === item.id
                        ? "text-white"
                        : "text-gray-600 dark:text-brand-400"
                    )}
                  />
                  {item.label}
                </button>
              );
            })}

            {/* Separator */}
            <div className="h-px bg-gray-300 dark:bg-brand-600 my-2"></div>

            {/* Dropdown Groups */}
            {navigationGroups.map((group) => (
              <div key={group.id}>
                <button
                  onClick={() => toggleGroup(group.id)}
                  className={cn(
                    "flex items-center justify-between w-full px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 border-2",
                    isGroupExpanded(group.id)
                      ? "bg-brand-600 text-white border-brand-600 shadow-md"
                      : "text-gray-700 dark:text-brand-300 hover:text-brand-600 dark:hover:text-brand-200 hover:bg-brand-50 dark:hover:bg-brand-700 border-transparent hover:border-brand-200 dark:hover:border-brand-500"
                  )}
                >
                  <span>{group.label}</span>
                  {isGroupExpanded(group.id) ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>

                {isGroupExpanded(group.id) && (
                  <div className="mt-2 ml-4 space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            navigate(`/${item.id}`);
                            setIsMobileMenuOpen(false);
                            setExpandedGroups([]);
                          }}
                          className={cn(
                            "flex items-center w-full px-4 py-2 text-sm rounded-lg transition-all duration-200 border-2",
                            activeSection === item.id
                              ? "bg-brand-100 dark:bg-brand-700 text-brand-600 dark:text-brand-200 border-brand-200 dark:border-brand-500"
                              : "text-gray-600 dark:text-brand-400 hover:text-brand-600 dark:hover:text-brand-200 hover:bg-brand-50 dark:hover:bg-brand-700 border-transparent hover:border-brand-200 dark:hover:border-brand-500"
                          )}
                        >
                          <Icon className="h-4 w-4 mr-3" />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {/* Mobile User Menu */}
            <div className="border-t-2 border-gray-200 dark:border-brand-600 pt-4 mt-4">
              <div className="flex items-center px-4 py-3 bg-gray-50 dark:bg-brand-700 rounded-lg mb-3">
                <div className="h-12 w-12 bg-gradient-to-br from-brand-600 to-brand-500 rounded-full flex items-center justify-center shadow-md mr-3">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-semibold text-gray-800 dark:text-white">
                    {user?.username}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-brand-400">
                    Admin
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-4 py-3 text-base font-semibold text-red-600 dark:text-red-400 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 border-2 border-red-200 dark:border-red-800 hover:border-red-600"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
