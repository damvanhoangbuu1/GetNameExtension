console.log("🔥 content.js Get Name trang 69shu đã được inject!");

const regex = /^(https?:\/\/)?(www\.)?(69shu|69shuba|69xinshu)\.(com|cx)\/(txt)\/\d+\/\d+$/;

const CONST_RETRY_COUNT = 5;

const createPrompt = (text) => {
  // return `${text} Phân tích tài liệu HTML được cung cấp, đại diện cho một chương của một câu chuyện. 
  // Trích xuất tất cả các thuật ngữ kỹ thuật và tên riêng. 
  // Dịch mỗi thuật ngữ kỹ thuật và tên riêng đã trích xuất sang tiếng Việt, ưu tiên tính chính xác và phù hợp về mặt văn hóa. 
  // Trả về thuật ngữ/tên riêng gốc và bản dịch tiếng Việt của nó, được định dạng như sau, với mỗi thuật ngữ/tên riêng trên một dòng mới: 
  // '[Thuật ngữ/Tên riêng gốc]=[Bản dịch tiếng Việt]\n'.
  //  Chỉ thuật ngữ/tên riêng đã dịch nên xuất hiện sau dấu bằng, không có dấu ngoặc kép hoặc văn bản giải thích bổ sung nào. 
  //  Đầu ra cuối cùng phải là một chuỗi duy nhất chứa tất cả các cặp thuật ngữ/bản dịch. 
  //  Cân nhắc bối cảnh của một câu chuyện hư cấu khi xác định các thuật ngữ kỹ thuật và tên riêng.`;
  // return `${text} Xác định và trích xuất tất cả các thuật ngữ kỹ thuật và tên riêng từ văn bản được cung cấp. 
  //                 Dịch mỗi thuật ngữ kỹ thuật hoặc tên riêng đã trích xuất sang tiếng Việt. 
  //                 Trả về thuật ngữ/tên riêng gốc và bản dịch của nó, được định dạng như sau, với mỗi thuật ngữ/tên riêng trên một dòng mới: 
  //                 '"Thuật ngữ/Tên riêng gốc"="Thuật ngữ/Tên riêng đã dịch",'. 
  //                 Đảm bảo rằng chỉ có thuật ngữ/tên riêng đã dịch được bao gồm sau dấu bằng, không có dấu ngoặc kép hoặc văn bản xung quanh. 
  //                 Ưu tiên tính chính xác và phù hợp về mặt văn hóa trong các bản dịch.
  //                 Output cuối cùng phải là một chuỗi duy nhất chứa tất cả các cặp thuật ngữ/bản dịch.`;
  return `${text} Phân tích văn bản đã cung cấp và trích xuất tất cả các tên riêng. 
  Đối với mỗi mục đã trích xuất, cung cấp bản dịch tương đương sang tiếng Việt, xem xét cả tính chính xác và phù hợp về mặt văn hóa. 
  Trả về kết quả dưới dạng một chuỗi JSON hợp lệ duy nhất. 
  Mỗi cặp khóa-giá trị trong JSON phải đại diện cho thuật ngữ gốc (tiếng Trung) và bản dịch tương đương (tiếng Việt) tương ứng. 
   Giá trị đã dịch *chỉ* chứa *duy nhất* bản dịch tiếng Việt, không cần mở ngoặc đơn giải thích, không có bất kỳ văn bản, nhãn hoặc dấu ngoặc kép bổ sung nào..
   Các loại tôn xưng hãy dịch thành kiểu 华师兄=Hoa sư huynh thay vì 华师兄=sư huynh Hoa.
  Đảm bảo đầu ra là một đối tượng JSON có cấu trúc tốt. Ví dụ: '{"Original Term":"Translated Term", "Another Term":"Another Translated Term"}'
  . Ưu tiên các bản dịch theo tiêu chuẩn ngành nếu có và chỉ rõ bất kỳ thuật ngữ nào không có bản dịch tiếng Việt trực tiếp.`;
}

const translateWithGemini = async (text, apiKey, retry = 0) => {
  let url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  let requestBody = {
    contents: [{ parts: [{ text: createPrompt(text) }] }]
  };

  console.log("Đang dịch...");

  try {
    let response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Lỗi HTTP: ${response.status}`);
    }

    let result = await response.json();
    console.log("Kết quả API:", result);

    if (result && result.candidates && result.candidates.length > 0) {
      let translatedText = result.candidates[0].content.parts[0].text;
      console.log(translatedText.replace('```json', '').replace('```', ''));
      console.log("Dịch xong:", JSON.parse(translatedText.replace('```json', '').replace('```', '')));
      addTranslations(JSON.parse(translatedText.replace('```json', '').replace('```', '')));
      setTimeout(() => {
        if (regex.test(document.querySelector('div.page1 > a:nth-child(4)').getAttribute('href'))) {
          window.location.href = document.querySelector('div.page1 > a:nth-child(4)').getAttribute('href');
        } else {
          exportIndexedDBToFile();
        }
      }, 2000);
    } else {
      console.error("Kết quả API khó tìm thấy");
    }
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    if (retry < CONST_RETRY_COUNT) {
      console.log("Retry:", retry);
      setTimeout(() => {
        translateWithGemini(text, apiKey, retry++);
      }, 5000);
    } else {
      exportIndexedDBToFile();
    }
  }
};

function saveToFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  console.log("✅ File đã được lưu:", filename);
}

async function getAllTranslations() {
  return new Promise((resolve, reject) => {
    let request = indexedDB.open("TranslationDB", 1);

    request.onsuccess = function (event) {
      let db = event.target.result;
      let transaction = db.transaction(["translations"], "readonly");
      let store = transaction.objectStore("translations");

      let getAllRequest = store.getAll();
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject("❌ Lỗi khi đọc dữ liệu!");
    };

    request.onerror = function () {
      reject("❌ Lỗi khi mở IndexedDB!");
    };
  });
}


async function exportIndexedDBToFile() {
  try {
    let data = await getAllTranslations();

    if (data.length === 0) {
      alert("⚠️ Không có dữ liệu để xuất!");
      return;
    }

    // Chuyển dữ liệu thành chuỗi theo format "key=value"
    let textContent = data.map(entry => `${entry.key}=${entry.name}`).join("\n");

    // Lưu vào file txt
    saveToFile(`translations${Date.now()}.txt`, textContent);
  } catch (error) {
    console.error(error);
  }
}


function openDatabase() {
  return new Promise((resolve, reject) => {
    let request = indexedDB.open("TranslationDB", 1);

    request.onupgradeneeded = function (event) {
      let db = event.target.result;
      if (!db.objectStoreNames.contains("translations")) {
        let store = db.createObjectStore("translations", { keyPath: "key" });
        console.log("✅ Object store 'translations' đã được tạo!");
      }
    };

    request.onsuccess = function (event) {
      resolve(event.target.result);
    };

    request.onerror = function (event) {
      reject("❌ Lỗi mở IndexedDB:", event.target.error);
    };
  });
}

async function addTranslations(data) {
  let db = await openDatabase();
  let transaction = db.transaction(["translations"], "readwrite");
  let store = transaction.objectStore("translations");

  for (let key in data) {
    if (key.length >= 2 && data[key].split(" ").length > 1) {
      store.put({ key: key, name: data[key].replace(/\s*\(.*?\)/g, "") });
    }
  }

  transaction.oncomplete = () => console.log("✅ Thêm dữ liệu hoàn tất!");
  transaction.onerror = () => console.error("❌ Lỗi khi thêm dữ liệu!");
}

const runTranslation = () => {
  if (!regex.test(window.location.href)) {
    console.log("Vui lòng nhập đúng host!");
    return;
  }

  chrome.storage.sync.get("geminiApiKey", function (data) {
    if (!data.geminiApiKey) {
      console.log("Vui lòng nhập API Key trong extension popup!");
      return;
    }

    document.querySelector('div.txtnav').innerHTML;
    translateWithGemini(document.querySelector('div.txtnav').innerText, data.geminiApiKey);
  });
}

setTimeout(runTranslation, 2000);