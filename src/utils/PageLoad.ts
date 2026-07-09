// Page Loader
export async function loadPageContent(
  page: string,
  container: HTMLElement,
): Promise<void> {
  try {
    const response = await fetch(`./pages/${page}.html`);

    if (!response.ok) {
      throw new Error(`Halaman "${page}" tidak ditemukan`);
    }

    container.innerHTML = await response.text();
  } catch (err) {
    console.error(err);

    container.innerHTML = `
      <article>
        <h3>Halaman gagal dimuat</h3>
        <p>${(err as Error).message}</p>
      </article>
    `;
  }
}

let loader: ((page: string) => Promise<void>) | null = null;

export function registerPageLoader(fn: (page: string) => Promise<void>) {
  loader = fn;
}

// Navigate
export function navigate(page: string) {
  loader?.(page);
}

// Update Layout
const sidebar = document.querySelector(".sidebar") as HTMLElement;
const appLayout = document.querySelector(".app-layout") as HTMLElement;

export function updateLayout() {
  const currentUser = sessionStorage.getItem("currentUser");
  if (currentUser) {
    sidebar.style.display = "";
    appLayout.classList.remove("login-layout");
  } else {
    sidebar.style.display = "none";
    appLayout.classList.add("login-layout");
  }
}

export function refreshUserUI() {
  const userInfo = document.querySelector<HTMLElement>("#user-info");
  const menuUsers = document.querySelector<HTMLElement>("#menu-users");

  const currentUser = sessionStorage.getItem("currentUser");

  if (!currentUser) {
    if (userInfo) userInfo.textContent = "";
    if (menuUsers) menuUsers.style.display = "none";
    return;
  }

  const user = JSON.parse(currentUser);

  if (userInfo) {
    userInfo.textContent = `${user.role === "ADMIN" ? "Admin" : "Kasir"}: ${user.fullName}`;
  }

  if (menuUsers) {
    menuUsers.style.display = user.role === "ADMIN" ? "" : "none";
  }
}
