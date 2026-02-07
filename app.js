let products = JSON.parse(localStorage.getItem("products")) || [];
let categories = JSON.parse(localStorage.getItem("categories")) || [];
let editIndex = null;

// تعريف الحقول
const pName = document.getElementById("pName");
const pQty = document.getElementById("pQty");
const pPrice = document.getElementById("pPrice");
const pCategory = document.getElementById("pCategory");
const pImage = document.getElementById("pImage");

// التنقل بين الصفحات
function showPage(page) {
  document.getElementById("productsPage").classList.remove("active");
  document.getElementById("categoriesPage").classList.remove("active");

  if (page === "products") {
    document.getElementById("productsPage").classList.add("active");
  } else {
    document.getElementById("categoriesPage").classList.add("active");
  }

  renderCategories();
  renderProducts();
}

// فتح الفورم
document.getElementById("addProductBtn").onclick = () => {
  editIndex = null;
  pName.value = "";
  pQty.value = "";
  pPrice.value = "";
  pCategory.value = "";
  pImage.value = "";
  fillCategoryDropdown();
  document.getElementById("productForm").style.display = "flex";
};

// إغلاق الفورم
function closeForm() {
  document.getElementById("productForm").style.display = "none";
}

// ملء Dropdown الأصناف
function fillCategoryDropdown() {
  pCategory.innerHTML = `<option value="">اختر الصنف</option>`;
  categories.forEach(cat => {
    pCategory.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
}

// حفظ (إضافة / تعديل)
function saveProduct() {
  if (!pName.value || !pQty.value || !pPrice.value || !pCategory.value || (!pImage.files[0] && editIndex === null)) {
    alert("⚠️ الرجاء ملء جميع الحقول واختيار صورة!");
    return;
  }

  if (pImage.files[0]) {
    let reader = new FileReader();
    reader.onload = function(e) {
      saveProductData(e.target.result);
    };
    reader.readAsDataURL(pImage.files[0]);
  } else {
    saveProductData(products[editIndex].image);
  }
}

function saveProductData(imageData) {
  let product = {
    name: pName.value,
    qty: pQty.value,
    price: pPrice.value,
    category: pCategory.value,
    image: imageData
  };

  if (editIndex !== null) {
    products[editIndex] = product;
    editIndex = null;
  } else {
    products.push(product);
  }

  localStorage.setItem("products", JSON.stringify(products));

  if (product.qty < 10) {
    alert("⚠️ انتبه: هذا المنتج قرب يخلص");
  }

  closeForm();
  renderProducts();
}

// عرض المنتجات
function renderProducts(listToRender = null) {
  let list = document.getElementById("productsList");
  list.innerHTML = "";

  const productsToShow = listToRender || products;

  productsToShow.forEach((p) => {
    const actualIndex = products.indexOf(p);

    list.innerHTML += `
      <div class="item" style="position:relative;">
        <div style="display:flex; align-items:center;">
          ${p.image ? `<img src="${p.image}" alt="${p.name}" style="width:50px;height:50px;border-radius:5px;margin-left:10px;">` : ''}
          <div>
            <b>${p.name}</b><br>
            كمية: <span class="${p.qty < 10 ? 'low' : ''}">${p.qty}</span> | سعر: ${p.price} | صنف: ${p.category}
          </div>
        </div>
        <button class="dots" onclick="toggleDropdown('p-${actualIndex}')">⋮</button>
        <div id="dropdown-p-${actualIndex}" class="dropdown" style="display:none; position:absolute; right:0; top:35px; background:#2e2e2e; border-radius:5px; box-shadow:0 2px 5px rgba(0,0,0,0.3); z-index:10;">
          <button onclick="editProduct(${actualIndex})" style="display:block; width:100%; padding:5px 10px; border:none; background:yellow; color:black; cursor:pointer; text-align:left;">تعديل</button>
          <button onclick="deleteProduct(${actualIndex})" style="display:block; width:100%; padding:5px 10px; border:none; background:red; color:white; cursor:pointer; text-align:left;">حذف</button>
        </div>
      </div>
    `;
  });
}

// البحث في المنتجات
const searchInput = document.querySelector("#productsPage .search");
searchInput.addEventListener("input", function() {
  const query = this.value.toLowerCase();
  const filtered = products.filter(p => p.name.toLowerCase().includes(query));
  renderProducts(filtered);
});

// Dropdown
function toggleDropdown(id) {
  const dropdown = document.getElementById(`dropdown-${id}`);
  if (dropdown.style.display === "none" || dropdown.style.display === "") {
    document.querySelectorAll(".dropdown").forEach(d => d.style.display = "none");
    dropdown.style.display = "block";
  } else {
    dropdown.style.display = "none";
  }
}

document.addEventListener("click", function(e) {
  if (!e.target.classList.contains("dots")) {
    document.querySelectorAll(".dropdown").forEach(d => d.style.display = "none");
  }
});

// حذف
function deleteProduct(index) {
  if (confirm("متأكد من الحذف؟")) {
    products.splice(index, 1);
    localStorage.setItem("products", JSON.stringify(products));
    renderProducts();
  }
}

// تعديل
function editProduct(index) {
  let p = products[index];
  editIndex = index;

  pName.value = p.name;
  pQty.value = p.qty;
  pPrice.value = p.price;
  pCategory.value = p.category;
  pImage.value = "";

  fillCategoryDropdown();
  document.getElementById("productForm").style.display = "flex";
}

// طباعة
function printProducts() {
  let html = `
    <html>
    <head>
      <title>تقرير الجرد</title>
      <style>
        body { font-family: Arial; direction: rtl; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 6px; text-align: center; }
        th { background: #ff8c00; color: white; }
      </style>
    </head>
    <body>
      <h2>تقرير جرد المستهلكات</h2>
      <table>
        <tr>
          <th>اسم المنتج</th>
          <th>الكمية</th>
          <th>السعر</th>
          <th>الصنف</th>
          <th>الصورة</th>
        </tr>
  `;

  products.forEach(p => {
    html += `
      <tr>
        <td>${p.name}</td>
        <td>${p.qty}</td>
        <td>${p.price}</td>
        <td>${p.category}</td>
        <td>${p.image ? `<img src="${p.image}" alt="${p.name}" style="width:50px;height:50px;">` : ''}</td>
      </tr>
    `;
  });

  html += `</table></body></html>`;

  let win = window.open("", "", "width=800,height=600");
  win.document.write(html);
  win.document.close();
  win.print();
}

/////////////////////////////
//  إضافة الأصناف
/////////////////////////////

const addCategoryBtn = document.querySelector("#categoriesPage .header button");
addCategoryBtn.onclick = () => {
  const catName = prompt("اكتب اسم الصنف الجديد:");
  if (!catName) return;

  if (!categories.includes(catName)) {
    categories.push(catName);
    localStorage.setItem("categories", JSON.stringify(categories));
    renderCategories();
    fillCategoryDropdown();
  } else {
    alert("هذا الصنف موجود مسبقاً!");
  }
};

// عرض الأصناف (مع دعم السيرش)
function renderCategories(listToRender = null) {
  const list = document.getElementById("categoriesList");
  list.innerHTML = "";

  const categoriesToShow = listToRender || categories;

  categoriesToShow.forEach((cat, index) => {
    list.innerHTML += `
      <div class="item" style="position:relative;">
        <span class="catName" data-cat="${cat}" style="cursor:pointer;">${cat}</span>
        <button class="dots" onclick="toggleDropdown('c-${index}')">⋮</button>
        <div id="dropdown-c-${index}" class="dropdown" style="display:none; position:absolute; right:0; top:35px; background:#2e2e2e; border-radius:5px; box-shadow:0 2px 5px rgba(0,0,0,0.3); z-index:10;">
          <button onclick="editCategory(${index})" style="display:block; width:100%; padding:5px 10px; border:none; background:yellow; color:black; cursor:pointer; text-align:left;">تعديل</button>
          <button onclick="deleteCategory(${index})" style="display:block; width:100%; padding:5px 10px; border:none; background:red; color:white; cursor:pointer; text-align:left;">حذف</button>
        </div>
      </div>
    `;
  });
}

// فتح المنتجات عند الضغط على اسم الصنف
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("catName")) {
    showProductsByCategory(e.target.dataset.cat);
  }
});

// البحث في الأصناف
const catSearchInput = document.getElementById("catSearch");
catSearchInput.addEventListener("input", function () {
  const query = this.value.toLowerCase();
  const filtered = categories.filter(cat => cat.toLowerCase().includes(query));
  renderCategories(filtered);
});

// عرض المنتجات حسب الصنف
function showProductsByCategory(catName) {
  showPage('products');
  const filtered = products.filter(p => p.category === catName);
  renderProducts(filtered);
}

// حذف صنف
function deleteCategory(index) {
  if (confirm("متأكد من حذف الصنف؟")) {
    const removedCat = categories.splice(index, 1)[0];
    localStorage.setItem("categories", JSON.stringify(categories));

    // حذف المنتجات اللي نفس الصنف
    products = products.filter(p => p.category !== removedCat);
    localStorage.setItem("products", JSON.stringify(products));

    renderCategories();
    renderProducts();
  }
}

// تعديل صنف
function editCategory(index) {
  const newName = prompt("اكتب الاسم الجديد للصنف:", categories[index]);
  if (!newName) return;

  if (!categories.includes(newName)) {
    const oldName = categories[index];
    categories[index] = newName;
    localStorage.setItem("categories", JSON.stringify(categories));

    // تحديث المنتجات اللي نفس الصنف
    products.forEach(p => {
      if (p.category === oldName) p.category = newName;
    });
    localStorage.setItem("products", JSON.stringify(products));

    renderCategories();
    renderProducts();
  } else {
    alert("هذا الاسم موجود مسبقاً!");
  }
}

// أول تشغيل
renderProducts();
renderCategories();

// ===== القائمة الجانبية =====
const menuBtn = document.getElementById("menuBtn");
const sideMenu = document.getElementById("sideMenu");
const sideOverlay = document.getElementById("sideOverlay");
const excelInput = document.getElementById("excelInput");

menuBtn.onclick = () => {
  sideMenu.classList.add("active");
  sideOverlay.classList.add("active");
  document.body.classList.add("menu-open"); // <--- تم إضافته
};

sideOverlay.onclick = () => {
  sideMenu.classList.remove("active");
  sideOverlay.classList.remove("active");
  document.body.classList.remove("menu-open"); // <--- تم إضافته
};

// ===== تصدير Excel =====
function exportToExcel() {
  if (products.length === 0) {
    alert("لا يوجد منتجات للتصدير");
    return;
  }

  const data = products.map(p => ({
    الاسم: p.name,
    الكمية: p.qty,
    السعر: p.price,
    الصنف: p.category
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Products");

  XLSX.writeFile(wb, "products_backup.xlsx");
}

// ===== استيراد Excel =====
function importFromExcel() {
  excelInput.click();
}

excelInput.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = evt => {
    const data = new Uint8Array(evt.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);

    products = json.map(r => ({
      name: r["الاسم"],
      qty: r["الكمية"],
      price: r["السعر"],
      category: r["الصنف"],
      image: ""
    }));

    localStorage.setItem("products", JSON.stringify(products));
    renderProducts();
    alert("تم الاستيراد بنجاح ✅");
  };
  reader.readAsArrayBuffer(file);
};

// ===== خروج =====
function exitApp() {
  if (confirm("هل تريد الخروج من البرنامج؟")) {
    window.close();
    alert("إذا لم تُغلق الصفحة، أغلقها يدويًا");
  }
}

// ===== لمحة عن المبرمج =====
function showAbout() {
  const aboutText = `
    مرحباً! 👋 أنا أعمل على تصميم وبرمجة المواقع، التطبيقات، وأنظمة الأعمال 
    بطريقة احترافية وسريعة.  
    إذا تحتاج موقع إلكتروني متجاوب، تطبيق جوال، أو نظام جرد/إدارة لشركتك،
    أنا جاهز أساعدك وأحول فكرتك إلى واقع.

    تواصل معي الآن وسأقوم بتنفيذ المشروع حسب احتياجك وبأفضل سعر.
0791153654
م.عبد الرحمن محمد كنعان

  `;

  document.getElementById("aboutText").innerText = aboutText;
  document.getElementById("aboutModal").style.display = "flex";
}

function closeAbout() {
  document.getElementById("aboutModal").style.display = "none";
}

document.getElementById("closeMenuBtn").addEventListener("click", function() {
  closeSideMenu();
});
function closeSideMenu() {
  document.getElementById("sideMenu").classList.remove("active");
  document.getElementById("sideOverlay").classList.remove("active");
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}

// ===== النسخ الاحتياطية  =====
function openBackupPage() {
  document.getElementById("backupPage").style.display = "flex";
}

function closeBackup() {
  document.getElementById("backupPage").style.display = "none";
}

const CLIENT_ID = "1099246027075-7gllnrmoq4db4t2093s31jfc8eaqdstk.apps.googleusercontent.com";
const API_KEY = "AIzaSyBV81_wlt16iFvS_3HrvmKGSomRD3w-GPw";
const SCOPES = "https://www.googleapis.com/auth/drive.file";
let tokenClient;
let gapiInited = false;

function gapiLoaded() {
  gapi.load("client", initializeGapiClient);
}

async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
  });
  gapiInited = true;
}
// ===== تسجيل الدخول + النسخ الاحتياطي   =====
function loginAndBackup() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (tokenResponse) => {
      uploadBackup();
    },
  });
  tokenClient.requestAccessToken();
}
// =====  إنشاء ملف النسخة الاحتياطية  =====
function getBackupData() {
  return JSON.stringify({
    products: JSON.parse(localStorage.getItem("products")) || [],
    categories: JSON.parse(localStorage.getItem("categories")) || []
  });
}

// =====   رفع النسخة (مع حذف القديمة) =====
async function uploadBackup() {
  try {
    const msg = document.getElementById("backupMsg");
    const data = getBackupData();

    // ابحث عن النسخة القديمة
    const res = await gapi.client.drive.files.list({
      q: "name='inventory_backup.json'"
    });

    if (res.result.files.length > 0) {
      await gapi.client.drive.files.delete({
        fileId: res.result.files[0].id
      });
    }

    const file = new Blob([data], { type: "application/json" });
    const metadata = {
      name: "inventory_backup.json",
      mimeType: "application/json"
    };

    const form = new FormData();
    form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    form.append("file", file);

    await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
      method: "POST",
      headers: new Headers({
        "Authorization": "Bearer " + gapi.client.getToken().access_token
      }),
      body: form
    });

    msg.textContent = "تمت المزامنة مع Google Drive بنجاح";
    msg.className = "success";

    startAutoBackup();

  } catch {
    backupError();
  }
}

// =====   النسخ التلقائي كل ساعة =====
function startAutoBackup() {
  setInterval(() => {
    uploadBackup();
  }, 60 * 60 * 1000);
}

// =====  استرجاع النسخة الاحتياطية  =====
async function restoreBackup() {
  try {
    const res = await gapi.client.drive.files.list({
      q: "name='inventory_backup.json'"
    });

    if (res.result.files.length === 0) {
      backupError();
      return;
    }

    const fileId = res.result.files[0].id;
    const file = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          "Authorization": "Bearer " + gapi.client.getToken().access_token
        }
      }
    );

    const data = await file.json();

    localStorage.setItem("products", JSON.stringify(data.products));
    localStorage.setItem("categories", JSON.stringify(data.categories));

    document.getElementById("backupMsg").textContent =
      "تم استرجاع البيانات بنجاح";
    document.getElementById("backupMsg").className = "success";

    renderProducts();
    renderCategories();

  } catch {
    backupError();
  }
}

// =====   تسجيل الخروج =====
function logoutDrive() {
  google.accounts.oauth2.revoke(
    gapi.client.getToken().access_token,
    () => {
      document.getElementById("backupMsg").textContent =
        "تم تسجيل الخروج وإيقاف النسخ الاحتياطي";
      document.getElementById("backupMsg").className = "error";
    }
  );
}

// =====    رسالة الخطأ (أحمر فقط)=====
function backupError() {
  const msg = document.getElementById("backupMsg");
  msg.textContent = "فشلت العملية، تأكد من تسجيل الدخول";
  msg.className = "error";
}
