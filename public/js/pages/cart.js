(function () {
    const DELIVERY_PER_PHARMACY = 20;

    function formatBaht(n) {
        return "฿" + n.toLocaleString("th-TH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function getItems() {
        return [...document.querySelectorAll("[data-item]")];
    }

    function recalcItem(item) {
        const price = Number(item.dataset.price);
        const input = item.querySelector("[data-qty-input]");
        const qty = Math.max(
            1,
            parseInt(input.value, 10) || 1
        );

        input.value = qty;

        const lineTotal = price * qty;

        item.querySelector("[data-line-total]").textContent =
            formatBaht(lineTotal);

        return lineTotal;
    }

    function recalcAll() {
        const items = getItems();
        let subtotal = 0;
        const pharmacies = new Set();

        items.forEach((item) => {
            subtotal += recalcItem(item);
            pharmacies.add(item.dataset.pharmacy);
        });

        const delivery = pharmacies.size * DELIVERY_PER_PHARMACY;

        const subtotalEl =
            document.querySelector("[data-summary-subtotal]");
        const deliveryEl =
            document.querySelector("[data-delivery-fee]");
        const totalEl =
            document.querySelector("[data-summary-total]");

        if (subtotalEl) {
            subtotalEl.textContent = formatBaht(subtotal);
        }

        if (deliveryEl) {
            deliveryEl.textContent = formatBaht(delivery);
        }

        if (totalEl) {
            totalEl.textContent = formatBaht(subtotal + delivery);
        }

        const checkout = document.querySelector("[data-checkout]");
        if (checkout) {
            checkout.disabled = items.length === 0;
        }

        // Remove empty pharmacy groups
        document.querySelectorAll(".pharmacy-group").forEach((group) => {
            if (!group.querySelector("[data-item]")) {
                group.remove();
            }
        });
    }

    async function sendRequest(url, method, body) {
        const options = {
            method,
            headers: {
                "Content-Type": "application/json"
            }
        };

        if (body !== undefined) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Request failed");
        }

        return result;
    }

    // Event delegation: รองรับรายการสินค้าในหน้า Cart
    document.addEventListener("click", async (event) => {
        const button = event.target.closest(
            "[data-qty-minus], [data-qty-plus], [data-remove-item]"
        );

        if (!button) return;

        const item = button.closest("[data-item]");
        if (!item || button.disabled) return;

        const itemID = item.dataset.cartItemId;
        const input = item.querySelector("[data-qty-input]");
        const oldQty = Number(input.value);
        const stock = Number(item.dataset.stock);

        // Remove item
        if (button.hasAttribute("data-remove-item")) {
            if (!confirm("ต้องการลบสินค้านี้ออกจากตะกร้าหรือไม่?")) {
                return;
            }

            button.disabled = true;

            try {
                const result = await sendRequest(
                    `/cart/item/${itemID}`,
                    "DELETE"
                );

                window.pmUpdateCartBadge(result.cartItemCount);
                item.remove();
                recalcAll();
                if (result.cartItemCount === 0) {
                    window.location.reload();
                }

                if (window.pmToast) {
                    window.pmToast("ลบสินค้าออกจากตะกร้าแล้ว");
                }
            } catch (error) {
                alert(error.message);
                button.disabled = false;
            }

            return;
        }

        // Change quantity
        let newQty = oldQty;

        if (button.hasAttribute("data-qty-minus")) {
            newQty--;
        } else {
            newQty++;
        }

        if (newQty < 1) return;

        if (newQty > stock) {
            alert("จำนวนสินค้าเกินสต็อกที่มี");
            return;
        }

        const buttons = item.querySelectorAll("button");
        buttons.forEach((btn) => btn.disabled = true);

        try {
            const result = await sendRequest(
                `/cart/item/${itemID}`,
                "PATCH",
                { quantity: newQty }
            );

            window.pmUpdateCartBadge(result.cartItemCount);
            input.value = newQty;
            recalcAll();

            if (window.pmToast) {
                window.pmToast("อัปเดตจำนวนสินค้าแล้ว");
            }
        } catch (error) {
            alert(error.message);
        } finally {
            buttons.forEach((btn) => btn.disabled = false);
        }
    });

    // Manual quantity input
    document.addEventListener("change", async (event) => {
        const input = event.target.closest("[data-qty-input]");
        if (!input) return;

        const item = input.closest("[data-item]");
        const itemID = item.dataset.cartItemId;
        const oldQty = Number(input.defaultValue);
        const stock = Number(item.dataset.stock);

        let quantity = Number(input.value);

        if (!Number.isInteger(quantity) || quantity < 1) {
            quantity = 1;
        }

        if (quantity > stock) {
            quantity = stock;
        }

        if (quantity < 1) {
            input.value = oldQty;
            return;
        }

        input.value = quantity;

        try {
            const result = await sendRequest(
                `/cart/item/${itemID}`,
                "PATCH",
                { quantity }
            );

            window.pmUpdateCartBadge(result.cartItemCount);
            recalcAll();
        } catch (error) {
            alert(error.message);
            window.location.reload();
        }
    });

    recalcAll();
})();
