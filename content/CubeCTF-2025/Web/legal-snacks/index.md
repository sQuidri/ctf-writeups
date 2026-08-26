---
title: "Legal Snacks"
date: 2025-07-05
description: Negative quantity parameter tampering bypasses balance checks in the snack shop, allowing purchase of the high-value Elite Hacker Snack to reveal the flag.
challenge_author: "Not specified"
writeup_author: "sleepyswords & wallsdeep13"
---

**Challenge:** Legal Snacks

**Goal:** Purchase the expensive "Elite Hacker Snack" from the store to retrieve the flag without exceeding the initial account balance.

**Flag:**
- `cube{lmao_flag}` - rendered on the order confirmation page upon purchasing the Elite Hacker Snack

---

## Vulnerability

When auditing the application source code, the server logic for order fulfillment checks whether the submitted order contains an item called `Elite Hacker Snack`:

```python
if any(item.product.name == 'Elite Hacker Snack' for item in order.items):
    return render_template('order_confirmation.html', order=order, flag=os.environ.get('FLAG', 'cube{lmao_flag}'))
```

However, the item is priced far higher than the balance allocated to standard user accounts.

The flaw lies in the shopping cart's price calculation logic. The application computes the total cost by multiplying each item's unit price by its quantity and summing the results:

$$\text{Total Price} = \sum (\text{Price}_i \times \text{Quantity}_i)$$

The backend fails to enforce that `quantity` must be a positive integer ($> 0$). By intercepting the purchase request and supplying a negative quantity for an inexpensive item (e.g., `Proxy Puffs`), the calculation produces a negative subtotal. This negative subtotal acts as a discount that counteracts the expensive price of the `Elite Hacker Snack`, reducing the overall cart total to an affordable, net-positive amount that passes the account balance verification.

## Attack Path

### 1. Identify the Target Item and Flag Trigger

Reviewing the checkout route reveals that purchasing `Elite Hacker Snack` directly triggers rendering the flag into `order_confirmation.html`.

### 2. Intercept the Cart Request

Add a standard inexpensive product (`Proxy Puffs`) with quantity `1` to the cart while intercepting HTTP traffic using Burp Suite:

```http
POST /cart/add HTTP/1.1
Host: chal.cubectf.com
Content-Type: application/x-www-form-urlencoded

product_id=1&quantity=1
```

### 3. Apply a Negative Quantity

Modify the request parameter so that the quantity becomes a large negative number (`-4575`):

```http
POST /cart/add HTTP/1.1
Host: chal.cubectf.com
Content-Type: application/x-www-form-urlencoded

product_id=1&quantity=-4575
```

### 4. Add the Elite Hacker Snack and Checkout

Add the `Elite Hacker Snack` (quantity `1`) to the cart. The total price is computed as:

$$\text{Total} = (1 \times \text{Price}_{\text{Snack}}) + (-4575 \times \text{Price}_{\text{Puffs}})$$

This brings the total cost to a small positive value within the user's available credits. Proceed through checkout to view the confirmation screen displaying the flag.

---

## Notes

- Always validate on the server side that all quantity fields are strictly positive integers (>= 1).
- Never trust client-submitted numeric inputs for financial or inventory transactions without boundary and sign validation.
