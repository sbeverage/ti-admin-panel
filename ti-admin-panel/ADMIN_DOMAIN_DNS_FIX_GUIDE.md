# 🔧 Admin Domain DNS Fix Guide



## ❌ Problem

**Error:** `DNS_PROBE_FINISHED_NXDOMAIN`  

**Domain:** `admin.forpurposetechnologies.com`  

**Issue:** DNS record not found or misconfigured



---



## 🔍 What This Means



The DNS record for `admin.forpurposetechnologies.com` is either:

1. ❌ Not created in your DNS provider (GoDaddy/Cloudflare)

2. ❌ Pointing to wrong location

3. ❌ Not propagated yet (can take up to 48 hours, usually 5-30 minutes)



---



## ✅ Solution: Fix DNS Configuration



### **Step 1: Check Where Your DNS is Managed**



Based on your setup, DNS should be managed in **Cloudflare** (since you're using Cloudflare for HTTPS).



**Check if domain is in Cloudflare:**

1. Go to: https://dash.cloudflare.com

2. Login to your account

3. Check if `forpurposetechnologies.com` is listed

4. If YES → Go to Step 2

5. If NO → Go to Step 3 (check GoDaddy)



---



### **Step 2: Add DNS Record in Cloudflare**



1. **In Cloudflare Dashboard:**

   - Click on `forpurposetechnologies.com`

   - Go to **"DNS"** → **"Records"**

   - Click **"Add record"**



2. **Add CNAME Record:**

   ```

   Type: CNAME

   Name: admin

   Target: cname.vercel-dns.com

   Proxy status: Proxied (orange cloud) ✅

   TTL: Auto

   ```



3. **OR if Vercel gave you a specific CNAME:**

   - Check Vercel Dashboard → Your Project → Settings → Domains

   - Use the exact CNAME target they provide



4. **Click "Save"**



5. **Wait 1-5 minutes** for DNS to propagate



---



### **Step 3: Check GoDaddy (If Not Using Cloudflare)**



If your DNS is managed in GoDaddy:



1. **Login to GoDaddy:**

   - Go to: https://www.godaddy.com

   - Login → My Products → DNS



2. **Add CNAME Record:**

   ```

   Type: CNAME

   Host: admin

   Points to: cname.vercel-dns.com

   TTL: 600 seconds

   ```



3. **Save and wait 5-30 minutes**



---



### **Step 4: Verify Vercel Configuration**



1. **Check Vercel Dashboard:**

   - Go to: https://vercel.com/dashboard

   - Find your `ti-admin-panel` project

   - Go to **Settings** → **Domains**

   - Verify `admin.forpurposetechnologies.com` is listed



2. **If Domain Not Added:**

   - Click **"Add Domain"**

   - Enter: `admin.forpurposetechnologies.com`

   - Vercel will show you the CNAME target to use

   - Copy that CNAME and add it to Cloudflare/GoDaddy



---



## 🧪 Verify DNS is Working



### **Test 1: Check DNS Resolution**

```bash

# Run this command:

nslookup admin.forpurposetechnologies.com



# Should return:

# admin.forpurposetechnologies.com canonical name = cname.vercel-dns.com

```



### **Test 2: Check if Site Loads**

```bash

# Run this command:

curl -I https://admin.forpurposetechnologies.com



# Should return:

# HTTP/2 200

# server: Vercel

```



### **Test 3: Check in Browser**

- Open: https://admin.forpurposetechnologies.com

- Should load the admin panel (not DNS error)



---



## 🚨 Common Issues & Fixes



### **Issue 1: "Domain not found in Vercel"**

**Fix:**

1. Go to Vercel Dashboard

2. Add domain: `admin.forpurposetechnologies.com`

3. Follow Vercel's instructions to add DNS record



### **Issue 2: "DNS record exists but site doesn't load"**

**Possible Causes:**

- DNS not propagated yet (wait 5-30 minutes)

- Wrong CNAME target (check Vercel for correct target)

- SSL certificate not issued yet (wait 5-10 minutes)



**Fix:**

1. Double-check CNAME target matches Vercel exactly

2. Wait 10-30 minutes for propagation

3. Clear browser cache and try again



### **Issue 3: "Cloudflare proxy disabled"**

**Fix:**

1. In Cloudflare DNS records

2. Find `admin` CNAME record

3. Click the orange cloud to enable proxy

4. Should turn orange (proxied)



---



## 📋 Quick Checklist



- [ ] Domain added in Vercel Dashboard

- [ ] CNAME record added in Cloudflare/GoDaddy

- [ ] CNAME target matches Vercel exactly

- [ ] Cloudflare proxy enabled (orange cloud)

- [ ] Waited 5-30 minutes for DNS propagation

- [ ] Tested with `nslookup` command

- [ ] Tested in browser



---



## 🆘 Still Not Working?



### **Option 1: Use Vercel's Default Domain**

While fixing DNS, you can use Vercel's default domain:

- Go to Vercel Dashboard → Your Project

- Copy the default URL (e.g., `ti-admin-panel.vercel.app`)

- Use that URL temporarily



### **Option 2: Check Vercel Deployment**

1. Go to Vercel Dashboard

2. Check if latest deployment succeeded

3. If failed, check deployment logs

4. Redeploy if needed



### **Option 3: Contact Support**

- **Vercel Support:** https://vercel.com/support

- **Cloudflare Support:** https://support.cloudflare.com

- **GoDaddy Support:** https://www.godaddy.com/help



---



## ✅ Expected Result



After fixing DNS:

- ✅ `admin.forpurposetechnologies.com` resolves to Vercel

- ✅ Site loads in browser

- ✅ HTTPS certificate works

- ✅ Admin panel is accessible



---



**Time to Fix:** 5-15 minutes (plus DNS propagation time)

