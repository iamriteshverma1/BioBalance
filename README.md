<div align="center">

# 🩺 BioBalance

### Personalized Health & Wellness Meal Recommendation Platform

**Track your health. Understand your trends. Make better everyday choices.**

<br>

<img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB"/>
<img src="https://img.shields.io/badge/Flask-000000?style=flat-square&logo=flask&logoColor=white"/>
<img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white"/>
<img src="https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white"/>
<img src="https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white"/>

<br><br>

<a href="#features">Features</a>
&nbsp; • &nbsp;
<a href="#how-it-works">How It Works</a>
&nbsp; • &nbsp;
<a href="#tech-stack">Tech Stack</a>
&nbsp; • &nbsp;
<a href="#installation">Installation</a>

</div>

---

## 🌱 About BioBalance

**BioBalance** is a full-stack wellness platform designed to help users
track important health readings, understand wellness trends, and receive
personalized meal guidance.

Instead of presenting health data as complicated numbers, BioBalance
turns it into simple insights and nutrition-focused recommendations.

> **Note:** BioBalance is an educational wellness project and is **not a
> medical diagnostic tool**. It should not replace professional medical advice.

---

## ✨ What Can BioBalance Do?

<table>
<tr>
<td width="50%">

### 📊 Track

Monitor important wellness indicators:

- Blood Pressure
- Blood Sugar
- Oxygen Saturation
- Wellness Score
- Historical Trends

</td>

<td width="50%">

### 🍱 Recommend

Get meal recommendations based on:

- Latest readings
- Wellness priorities
- Nutrition tags
- Dietary compatibility

</td>
</tr>

<tr>
<td width="50%">

### ❤️ Understand

The system provides explainable wellness insights instead of hiding
recommendations behind a black-box system.

</td>

<td width="50%">

### 👨‍👩‍👧 Share

Generate secure, revocable family links so trusted family members can
view selected wellness information.

</td>
</tr>
</table>

---

# 🖥️ Application Preview

<div align="center">

<!-- Replace these with your actual screenshots -->

<img src="./screenshots/dashboard.png" width="90%"/>

<br><br>

<img src="./screenshots/meals.png" width="43%"/>
&nbsp;&nbsp;
<img src="./screenshots/family-sharing.png" width="43%"/>

</div>

---

# 🔄 How It Works

```text
                    USER
                      │
                      ▼
              ┌───────────────┐
              │ Health Inputs │
              │               │
              │ BP / Sugar    │
              │ Oxygen Level  │
              └───────┬───────┘
                      │
                      ▼
             ┌─────────────────┐
             │ Wellness Engine │
             └────────┬────────┘
                      │
             ┌────────┴────────┐
             ▼                 ▼
      Wellness Flags      Nutrition Tags
             │                 │
             └────────┬────────┘
                      ▼
              ┌───────────────┐
              │ Meal Matching │
              └───────┬───────┘
                      │
                      ▼
              🍱 Recommendations
