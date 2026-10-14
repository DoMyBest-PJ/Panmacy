(function () {

const tabs = document.querySelectorAll(".forum-tab");
const threadList = document.querySelector(".thread-list");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    // เปลี่ยนสถานะปุ่มที่เลือก
    tabs.forEach(button => {
      button.classList.remove("is-active");
    });
    tab.classList.add("is-active");

    // ดึงกระทู้ทั้งหมดที่แสดงอยู่
    const threads = Array.from(
      threadList.querySelectorAll(".thread-card")
    );

    // เรียงกระทู้ตามปุ่มที่เลือก
    if (tab.dataset.sort === "latest") {
      threads.sort((a, b) =>
        Number(b.dataset.date) - Number(a.dataset.date)
      );
    } else if (tab.dataset.sort === "popular") {
      threads.sort((a, b) =>
        Number(b.dataset.comments) - Number(a.dataset.comments)
      );
    }

    // เปลี่ยนตำแหน่งการ์ดในหน้าเว็บ
    threads.forEach(thread => {
      const item = thread.parentElement.tagName === "A"
        ? thread.parentElement
        : thread;
      threadList.appendChild(item);
    });
  });
});



})();
