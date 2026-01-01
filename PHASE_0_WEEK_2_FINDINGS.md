# Phase 0, Week 2: Research & Audit Findings

**Date:** December 30, 2025
**Migration:** AngularJS 1.4.14 → Angular 18

---

## Executive Summary

Week 2 research focused on identifying replacement options for deprecated AngularJS libraries and auditing jQuery usage. Key findings:

- **Trix Editor**: Recommend Quill.js as replacement (permissive license, actively maintained)
- **jQuery**: Not used in production code (test files only) - no migration needed
- **ng-file-upload**: Used for image upload; migrate in Phase 3, Week 18

---

## 1. Trix Editor Replacement Research

### Current State

**Usage Locations:**
- `app/recipe-lib/new-recipe/new-recipe.html` - Recipe creation editor
- `app/recipe-lib/view-recipe/view-recipe.html` - Recipe editing editor

**Current Implementation:**
```html
<trix-editor id="recipe-editor" angular-trix ng-model="newRecipeContent"
    placeholder="Recipe Content" toolbar="trix-toolbar"></trix-editor>
<trix-toolbar id="trix-toolbar"></trix-toolbar>
```

**Dependencies:**
- `angular-trix`: 1.0.2 (AngularJS 1.x wrapper)
- `trix`: 1.0.0 (underlying editor library)
- Loaded via Bower

---

### Evaluated Options

#### Option 1: Quill.js ⭐ **RECOMMENDED**

**Overview:**
- Modern, lightweight rich text editor
- Rewritten in TypeScript for v2 (April 2024)
- Used by Slack, LinkedIn, Figma, Zoom, Miro, Airtable

**Technical Details:**
- **License:** BSD-3-Clause (permissive, no restrictions)
- **Angular Integration:** `ngx-quill` (actively maintained, updated Dec 2025)
- **Latest Version:** 2.0+ (TypeScript)
- **Bundle Size:** Lightweight compared to competitors
- **Performance:** High performance with large documents

**Key Features:**
- Customizable toolbar
- Custom "blots" system (similar to ProseMirror schemas)
- Reactive forms support
- Template-driven forms support
- Module-based extensibility
- No built-in collaboration (can be added via libraries)

**Migration Path:**
```typescript
// Angular Component
import { QuillModule } from 'ngx-quill';

// Template
<quill-editor
  [(ngModel)]="recipeContent"
  [placeholder]="'Recipe Content'"
  [modules]="quillModules">
</quill-editor>
```

**Pros:**
- ✅ Permissive license (no GPL restrictions)
- ✅ No paywall features
- ✅ Modern, TypeScript-based
- ✅ Excellent performance
- ✅ Straightforward migration
- ✅ Active community support

**Cons:**
- ⚠️ No built-in real-time collaboration (not needed for this project)
- ⚠️ Requires custom implementation for advanced features

**Resources:**
- [ngx-quill on npm](https://www.npmjs.com/package/ngx-quill)
- [GitHub: KillerCodeMonkey/ngx-quill](https://github.com/KillerCodeMonkey/ngx-quill)
- [Quill.js Official Site](https://quilljs.com/)
- [Tutorial: Build a rich text editor in Angular with ngx-quill](https://dev.to/trungk18/build-a-rich-text-editor-in-angular-with-ngx-quill-4i6d)

---

#### Option 2: CKEditor 5

**Overview:**
- Enterprise-grade editor with 20+ years of development
- Feature-rich with extensive plugin ecosystem

**Technical Details:**
- **License:** GPL-2 (requires open-sourcing derivative work) OR commercial license
- **Angular Integration:** `@ckeditor/ckeditor5-angular` (Angular 13+)
- **Latest Version:** 5.x (modern rewrite from CKEditor 4)
- **Company:** CKSource (commercial backing)

**Key Features:**
- Advanced collaboration features (real-time editing)
- Extensive plugin system
- Professional support available
- Framework support: React, Vue, Next, Angular

**Pros:**
- ✅ Enterprise-grade features
- ✅ Professional support available
- ✅ Advanced collaboration tools
- ✅ Mature, battle-tested

**Cons:**
- ❌ GPL-2 license (requires commercial license for proprietary apps)
- ❌ Many features behind paywall (markdown, media embeds, mentions, comments, multi-level lists)
- ❌ Heavier bundle size
- ❌ More complex setup

**Resources:**
- [CKEditor 5 Angular Integration](https://ckeditor.com/docs/ckeditor5/latest/getting-started/installation/cloud/angular.html)
- [@ckeditor/ckeditor5-angular on npm](https://www.npmjs.com/package/@ckeditor/ckeditor5-angular)

---

#### Option 3: TinyMCE

**Overview:**
- Mature editor (20+ years) with active maintenance
- Similar feature set to CKEditor

**Technical Details:**
- **License:** GPL-2 OR commercial license
- **Angular Integration:** `@tinymce/tinymce-angular` (v9.1.1, monthly updates)
- **Hosting Options:** Cloud CDN or self-hosted
- **Company:** Tiny Technologies (commercial backing)

**Key Features:**
- Comparable features to CKEditor
- Cloud or self-hosted deployment
- External service integrations for collaboration
- Framework support: React, Vue, Angular

**Pros:**
- ✅ Well-maintained and actively developed
- ✅ Multiple hosting options
- ✅ Slightly easier to use than CKEditor (score: 8.9 vs 8.7)
- ✅ Professional support available

**Cons:**
- ❌ GPL-2 license (requires commercial license for proprietary apps)
- ❌ Many plugins behind paywall (markdown, mentions, comments, advanced typography)
- ❌ No built-in real-time collaboration
- ❌ Heavier than Quill

**Resources:**
- [TinyMCE Angular Integration](https://www.tiny.cloud/docs/tinymce/latest/angular-pm/)
- [@tinymce/tinymce-angular on npm](https://www.npmjs.com/package/@tinymce/tinymce-angular)

---

### Comparison Matrix

| Feature | Quill.js | CKEditor 5 | TinyMCE |
|---------|----------|------------|---------|
| **License** | BSD-3-Clause (Permissive) | GPL-2 / Commercial | GPL-2 / Commercial |
| **Cost** | Free | Free basic / Paid premium | Free basic / Paid premium |
| **Bundle Size** | Lightweight | Heavy | Heavy |
| **Performance** | Excellent | Good | Good |
| **Angular Support** | ngx-quill (active) | Official (active) | Official (active) |
| **Learning Curve** | Moderate | Steep | Moderate |
| **Customization** | High | High | High |
| **Collaboration** | Via extensions | Built-in (paid) | Via integrations (paid) |
| **TypeScript** | ✅ Native (v2+) | ✅ Supported | ✅ Supported |
| **Maintenance** | Active | Active | Active |

---

### Recommendation: Quill.js

**Rationale:**

1. **License Freedom**: BSD-3-Clause allows unrestricted use in commercial applications without GPL obligations
2. **No Paywalls**: All core features are free and open source
3. **Modern Architecture**: TypeScript-based v2 aligns with Angular 18
4. **Performance**: Superior performance with large documents
5. **Active Maintenance**: Updated December 2025, strong community
6. **Simpler Migration**: Lighter weight and easier to integrate than enterprise alternatives
7. **Proven at Scale**: Used by major companies (Slack, LinkedIn, Figma, Zoom)

**When to Consider Alternatives:**
- If built-in real-time collaboration is required → CKEditor 5 (with paid plan)
- If enterprise support contract is required → CKEditor 5 or TinyMCE (with paid plan)
- If complex document workflows are needed → CKEditor 5

**For this project**, Quill.js is the optimal choice given the straightforward rich text editing requirements and the benefits of a permissive license.

**External Research:**
- [Which rich text editor framework should you choose in 2025?](https://liveblocks.io/blog/which-rich-text-editor-framework-should-you-choose-in-2025)

---

## 2. jQuery Audit

### Findings

**Production Code:** ✅ **Zero jQuery usage**

**Test Code:** 162 occurrences across 11 spec files

**Breakdown:**

```
app/recipe-lib/spec-utils.spec.js: 3 occurrences
app/recipe-lib/view-recipe/view-recipe.spec.js: 24 occurrences
app/recipe-lib/new-recipe/new-recipe.spec.js: 10 occurrences
app/recipe-lib/search/search-recipes.spec.js: 4 occurrences
app/recipe-lib/recipe-book/recipe-book.spec.js: 7 occurrences
app/recipe-lib/recipe/recipe-card-wall.spec.js: 2 occurrences
app/recipe-lib/home/home.spec.js: 11 occurrences
app/recipe-lib/recipe/recipe.spec.js: 21 occurrences
app/recipe-lib/image-upload/image-upload.spec.js: 23 occurrences
app/recipe-lib/navbar/navbar.spec.js: 22 occurrences
app/recipe-lib/image-upload/image-upload-modal.spec.js: 35 occurrences
```

**Usage Pattern in Tests:**
```javascript
// DOM element selection
var element = $('.some-class');
var button = $('#some-id');

// Visibility assertions (jasmine-jquery matchers)
expect($('.element')).toBeVisible();
expect($('.element')).not.toBeVisible();

// Event triggering
SpecUtils.clickElement($('.button'));

// Text content assertions
expect($('.title').text()).toBe('Expected Text');
```

### Analysis

**Why jQuery is in Tests:**
- **jasmine-jquery** library provides jQuery-based matchers (`toBeVisible()`, `toHaveText()`, etc.)
- DOM manipulation for test setup and assertions
- Helper utilities in `spec-utils.spec.js`

**Impact on Migration:**
- ✅ **No blocking issues** - production code is jQuery-free
- Tests will continue to work during AngularJS → Angular transition
- jQuery is loaded via Bower for test environment only

### Recommendation

**Phase 0-2 (AngularJS to Angular Hybrid):**
- ✅ **Keep jQuery in tests** - no migration needed
- Focus on production code migration
- Tests remain stable during transition

**Phase 3 (Post-Migration Cleanup) - OPTIONAL:**
- Consider replacing jasmine-jquery with Angular testing utilities:
  - `TestBed.createComponent()` for component testing
  - `DebugElement.query()` for element selection
  - `fixture.nativeElement` for DOM access
  - Angular's built-in matchers

**Priority:** Low - This is a nice-to-have improvement, not required for migration success

---

## 3. ng-file-upload Audit

### Current Implementation

**Purpose:** Image upload with cropping functionality

**Files Using ng-file-upload:**

**Production:**
- `app/recipe-lib/app.js` - Module declaration (`'ngFileUpload'`)
- `app/recipe-lib/image-upload/image-upload.js` - Upload controller
- `app/recipe-lib/image-upload/image-upload.html` - Upload directives
- `app/recipe-lib/image-upload/image-upload-modal.js` - Modal controller
- `app/recipe-lib/image-upload/image-upload-modal.html` - Modal template

**Tests:**
- `app/recipe-lib/image-upload/image-upload.spec.js`
- `app/recipe-lib/image-upload/image-upload-modal.spec.js`

**Additional Dependencies:**
- `ng-img-crop` (0.3.2) - Image cropping before upload
- Both are AngularJS 1.x specific libraries

---

### Features Used

**File Selection:**
```html
<button ngf-select ng-model="picFile" accept="image/*"
    ngf-change="startProcessing()">Select Image</button>
```

**Drag & Drop:**
```html
<div ngf-drop ng-model="picFile" ngf-pattern="image/*" class="cropArea">
    <img-crop image="picFile | ngfDataUrl" result-image="croppedDataUrl"
        area-type="square"></img-crop>
</div>
```

**Upload Service:**
```javascript
Upload.upload({
    url: '/api/image',
    data: {
        file: Upload.dataUrltoBlob(dataUrl, name)
    }
}).then(function (response) {
    // Handle success
});
```

**Key Capabilities:**
- File selection via button
- Drag and drop support
- File type validation (`ngf-pattern`)
- Data URL conversion (`ngfDataUrl` filter)
- Blob conversion (`Upload.dataUrltoBlob()`)
- HTTP upload with multipart/form-data
- Progress tracking (not currently used)
- Integration with ng-img-crop for image cropping

---

### Migration Strategy

**Replace With:**

1. **File Selection** → Native HTML5 + Angular
   ```html
   <input type="file" (change)="onFileSelected($event)" accept="image/*">
   ```

2. **Drag & Drop** → HTML5 Drag and Drop API
   ```typescript
   @HostListener('drop', ['$event'])
   onDrop(event: DragEvent) {
     event.preventDefault();
     const files = event.dataTransfer?.files;
     // Handle files
   }
   ```

3. **Upload** → Angular HttpClient
   ```typescript
   uploadImage(file: File) {
     const formData = new FormData();
     formData.append('file', file);

     return this.http.post('/api/image', formData);
   }
   ```

4. **Image Cropping** → `ngx-image-cropper`
   - Angular-native library
   - Similar functionality to ng-img-crop
   - TypeScript support
   - [GitHub: ngx-image-cropper](https://github.com/Mawi137/ngx-image-cropper)

---

### Migration Timeline

**Recommended Phase:** **Phase 3, Week 18** (per migration plan)

**Rationale:**
- Non-critical feature (not blocking core functionality)
- Requires both ng-file-upload AND ng-img-crop replacement
- Better to migrate together as a cohesive unit
- Native Angular APIs provide equivalent functionality
- Allows focus on core features in earlier phases

**Migration Tasks (Week 18):**
1. Replace ng-file-upload directives with native HTML5 file input
2. Implement HTML5 drag-and-drop handlers
3. Replace ng-img-crop with ngx-image-cropper
4. Migrate upload service to HttpClient with FormData
5. Update tests to use Angular testing utilities
6. Test image upload flow end-to-end

**Estimated Effort:** 1-2 days (straightforward replacement)

---

## Summary & Next Steps

### Week 2 Deliverables ✅

1. ✅ **Trix Editor Research** - Quill.js recommended
2. ✅ **jQuery Audit** - No production code impact (tests only)
3. ✅ **ng-file-upload Audit** - Migrate in Week 18 with native APIs

### Decision Matrix

| Item | Action | Timeline | Priority |
|------|--------|----------|----------|
| Trix → Quill.js | Migrate | Phase 2 (Week 9-10) | High |
| jQuery in tests | Keep as-is | Optional cleanup post-migration | Low |
| ng-file-upload | Replace with native APIs | Phase 3 (Week 18) | Medium |
| ng-img-crop | Replace with ngx-image-cropper | Phase 3 (Week 18) | Medium |

### Recommended Next Steps

**Week 3 Actions:**
1. Install TypeScript and configure tsconfig.json
2. Create `src/` directory structure alongside `app/`
3. Install Angular CLI
4. Migrate from Bower to npm for dependencies
5. Update node-app.js to serve both AngularJS and Angular
6. Run all tests to verify setup

### Notes

- All research sources documented with links
- Audit findings show minimal blocking issues
- Migration path is clear and low-risk
- Week 2 successfully completed ahead of schedule

---

**Document Version:** 1.0
**Last Updated:** December 30, 2025
**Next Review:** Phase 2, Week 9 (Trix migration)
