# Design System Rehberi

Bu dokümantasyon, projenin design system'ını ve tutarlı tasarım kurallarını açıklar.

## 🎨 Renk Paleti

### Primary Colors (Mavi)
```typescript
colors.primary.50    // bg-blue-50 dark:bg-blue-900/20
colors.primary.100   // bg-blue-100 dark:bg-blue-900/30
colors.primary.600   // bg-blue-600
colors.primary.text  // text-blue-600 dark:text-blue-400
colors.primary.border // border-blue-300 dark:border-blue-700
colors.primary.hover // hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20
```

### Success Colors (Yeşil)
```typescript
colors.success.50    // bg-green-50 dark:bg-green-900/20
colors.success.600   // bg-green-600
colors.success.text  // text-green-600 dark:text-green-400
```

### Warning Colors (Sarı)
```typescript
colors.warning.50    // bg-yellow-50 dark:bg-yellow-900/20
colors.warning.600   // bg-yellow-600
colors.warning.text  // text-yellow-600 dark:text-yellow-400
```

### Danger Colors (Kırmızı)
```typescript
colors.danger.50     // bg-red-50 dark:bg-red-900/20
colors.danger.600    // bg-red-600
colors.danger.text   // text-red-600 dark:text-red-400
```

## 📏 Spacing Sistemi

### Padding Standardları
```typescript
spacing.padding.card        // p-4
spacing.padding.cardLarge   // p-6
spacing.padding.cardSmall   // p-3
spacing.padding.section     // px-4 sm:px-6 lg:px-8
```

### Margin Standardları
```typescript
spacing.margin.section      // mb-6
spacing.margin.element      // mb-4
spacing.margin.small        // mb-2
```

### Gap Standardları
```typescript
spacing.gap.small          // gap-2
spacing.gap.medium         // gap-4
spacing.gap.large          // gap-6
spacing.gap.grid           // gap-3 sm:gap-4
```

## 🏗️ Layout Sistemi

### Grid Sistemleri
```typescript
layout.grid.stats          // grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4
layout.grid.cards          // grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
layout.grid.responsive     // grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4
```

### Flex Sistemleri
```typescript
layout.flex.between        // flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4
layout.flex.center         // flex items-center justify-center
layout.flex.end            // flex justify-end gap-2
```

## 🎯 Component Stilleri

### Card Stilleri
```typescript
cardStyles.base            // Temel kart stili
cardStyles.interactive     // Hover efektli interaktif kart
cardStyles.stat            // İstatistik kartları için gradient
cardStyles.listItem        // Liste elemanları için
cardStyles.header          // Header kartları için
```

### Button Stilleri
```typescript
buttonStyles.variants.primary    // Mavi primary button
buttonStyles.variants.success    // Yeşil success button
buttonStyles.variants.danger     // Kırmızı danger button
buttonStyles.variants.outline    // Outline button
buttonStyles.sizes.sm           // Küçük button
buttonStyles.sizes.md           // Orta button
buttonStyles.sizes.lg           // Büyük button
```

### Badge Stilleri
```typescript
badgeStyles.variants.default    // Mavi badge
badgeStyles.variants.success    // Yeşil badge
badgeStyles.variants.warning    // Sarı badge
badgeStyles.variants.danger     // Kırmızı badge
badgeStyles.variants.outline    // Outline badge
```

## 📱 Responsive Tasarım

### Breakpoint'ler
```typescript
responsive.mobile          // block sm:hidden
responsive.desktop         // hidden sm:block
responsive.tablet          // hidden md:block lg:hidden
```

### Responsive Text
```typescript
responsive.text.title      // text-xl sm:text-2xl
responsive.text.subtitle   // text-base sm:text-lg
responsive.text.body       // text-sm sm:text-base
responsive.text.caption    // text-xs sm:text-sm
```

## 🛠️ Kullanım Örnekleri

### Renk Kullanımı
```typescript
// ✅ Doğru kullanım
<div className={colors.primary.bg}>
<span className={colors.success.text}>
<button className={colors.danger.hover}>

// ❌ Yanlış kullanım
<div className="bg-blue-600">  // Hardcoded renk
<span className="text-green-500">  // Design system dışı
```

### Spacing Kullanımı
```typescript
// ✅ Doğru kullanım
<div className={spacing.padding.card}>
<section className={spacing.space.section}>

// ❌ Yanlış kullanım
<div className="p-3">  // Hardcoded spacing
<section className="space-y-5">  // Standard dışı
```

### Layout Kullanımı
```typescript
// ✅ Doğru kullanım
<div className={layout.grid.stats}>
<div className={layout.flex.between}>

// ❌ Yanlış kullanım
<div className="grid grid-cols-4 gap-3">  // Tekrar kod
```

## 🎨 Dark Mode Desteği

Tüm renkler otomatik dark mode desteği ile gelir:

```typescript
// Light mode: bg-blue-50
// Dark mode: bg-blue-900/20
colors.primary.50

// Light mode: text-blue-600  
// Dark mode: text-blue-400
colors.primary.text
```

## 📋 Checklist

Yeni component oluştururken:

- [ ] Design system renklerini kullandım
- [ ] Spacing standardlarını uyguladım
- [ ] Responsive tasarım kurallarını takip ettim
- [ ] Dark mode desteği ekledim
- [ ] TypeScript tiplerini doğru kullandım
- [ ] Accessibility kurallarına uydum

## 🚫 Yasaklı Kullanımlar

```typescript
// ❌ Hardcoded renkler
className="bg-blue-600 text-white"

// ❌ Hardcoded spacing
className="p-4 mb-6 gap-3"

// ❌ Hardcoded responsive
className="text-lg sm:text-xl"

// ❌ Inline styles
style={{ backgroundColor: '#3b82f6' }}
```

## ✅ Önerilen Kullanımlar

```typescript
// ✅ Design system renkleri
className={cn(colors.primary.bg, colors.neutral.text)}

// ✅ Design system spacing
className={cn(spacing.padding.card, spacing.margin.element)}

// ✅ Design system responsive
className={responsive.text.title}

// ✅ Helper fonksiyonlar
className={getButtonClass('primary', 'lg')}
className={getBadgeClass('success')}
```

Bu design system sayesinde tüm proje tutarlı, yönetilebilir ve ölçeklenebilir bir tasarıma sahip! 🎨 