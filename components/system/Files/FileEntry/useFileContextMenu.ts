import extensions from "components/system/Files/FileEntry/extensions";
import useFile from "components/system/Files/FileEntry/useFile";
import type { FileActions } from "components/system/Files/FileManager/useFolder";
import { useMenu } from "contexts/menu";
import type { MenuItem } from "contexts/menu/useMenuContextState";
import { useProcesses } from "contexts/process";
import processDirectory from "contexts/process/directory";
import { dirname, extname } from "path";
import type React from "react";
import { MENU_SEPERATOR, SHORTCUT_EXTENSION } from "utils/constants";

const useFileContextMenu = (
  url: string,
  pid: string,
  path: string,
  setRenaming: React.Dispatch<React.SetStateAction<boolean>>,
  { deleteFile, downloadFile }: FileActions
): { onContextMenuCapture: React.MouseEventHandler<HTMLElement> } => {
  const { open } = useProcesses();
  const { process: [, ...openWith] = [] } = extensions[extname(url)] || {};
  const openWithFiltered = openWith.filter((id) => id !== pid);
  const { icon: pidIcon } = processDirectory[pid] || {};
  const openFile = useFile(url);
  const menuItems: MenuItem[] = [
    { label: "Delete", action: () => deleteFile(path) },
    { label: "Rename", action: () => setRenaming(true) },
  ];
  const extension = extname(path);
  const isShortcut = extension === SHORTCUT_EXTENSION;
  const { contextMenu } = useMenu();

  if (!isShortcut && url && (extension || pid !== "FileExplorer")) {
    menuItems.unshift(MENU_SEPERATOR);

    menuItems.unshift({
      label: "Download",
      action: () => downloadFile(path),
    });
  }

  if (pid) {
    menuItems.unshift(MENU_SEPERATOR);

    if (openWithFiltered.length > 0) {
      menuItems.unshift({
        label: "Open with",
        menu: openWithFiltered.map((id): MenuItem => {
          const { icon, title: label } = processDirectory[id] || {};
          const action = () => openFile(id);

          return { icon, label, action };
        }),
      });
    }

    if (isShortcut) {
      menuItems.unshift({
        label: "Open file location",
        action: () => open("FileExplorer", dirname(url)),
      });
    }

    menuItems.unshift({
      icon: isShortcut || extname(url) ? pidIcon : undefined,
      label: "Open",
      primary: true,
      action: () => openFile(pid),
    });
  }

  return {
    onContextMenuCapture: contextMenu?.(menuItems),
  };
};

export default useFileContextMenu;