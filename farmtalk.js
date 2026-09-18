// ==========================================
// 4. 게시판 (FARM TALK) 로직 (LocalStorage 기반)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const boardTableBody = document.querySelector('.board-table tbody');
    if (!boardTableBody) return; // farmtalk.html이 아닌 페이지면 리턴

    const STORAGE_KEY = 'farmio_board_posts';
    let isAdminSession = sessionStorage.getItem('farmio_admin_logged') === 'true';

    // 세션 기록 (수정/삭제 권한 확인용)
    let myPosts = [];
    try { myPosts = JSON.parse(sessionStorage.getItem('farmio_my_posts') || '[]'); } catch(e) {}
    let myComments = [];
    try { myComments = JSON.parse(sessionStorage.getItem('farmio_my_comments') || '[]'); } catch(e) {}
    
    function saveMyPosts() { sessionStorage.setItem('farmio_my_posts', JSON.stringify(myPosts)); }
    function saveMyComments() { sessionStorage.setItem('farmio_my_comments', JSON.stringify(myComments)); }

    // 작성자 익명화 처리 함수
    
    function promptPasswordModal(message, expectedPassword) {
        return new Promise((resolve) => {
            const modal = document.getElementById('passwordModal');
            const msgEl = document.getElementById('passwordModalMessage');
            const input = document.getElementById('passwordModalInput');
            const errorEl = document.getElementById('passwordModalError');
            const confirmBtn = document.getElementById('confirmPasswordModal');
            const cancelBtn = document.getElementById('cancelPasswordModal');
            const closeBtn = document.getElementById('closePasswordModal');

            if (!modal) {
                const val = prompt(message);
                if (val !== null && val !== expectedPassword) {
                    alert('비밀번호가 일치하지 않습니다.');
                    resolve(null);
                } else {
                    resolve(val);
                }
                return;
            }

            msgEl.textContent = message;
            input.value = '';
            if(errorEl) errorEl.style.display = 'none';
            modal.classList.add('active');
            input.focus();

            function cleanup() {
                confirmBtn.removeEventListener('click', onConfirm);
                cancelBtn.removeEventListener('click', onCancel);
                closeBtn.removeEventListener('click', onCancel);
                input.removeEventListener('keyup', onEnter);
                modal.classList.remove('active');
            }

            function onConfirm() {
                const val = input.value.trim();
                if (val !== expectedPassword) {
                    if(errorEl) {
                        errorEl.style.display = 'block';
                        errorEl.classList.add('shake');
                        setTimeout(() => errorEl.classList.remove('shake'), 400);
                    } else {
                        alert('비밀번호가 일치하지 않습니다.');
                    }
                    input.value = '';
                    input.focus();
                    return;
                }
                cleanup();
                resolve(val || null);
            }

            function onCancel() {
                cleanup();
                resolve(null);
            }

            function onEnter(e) {
                if (e.key === 'Enter') onConfirm();
            }

            confirmBtn.addEventListener('click', onConfirm);
            cancelBtn.addEventListener('click', onCancel);
            closeBtn.addEventListener('click', onCancel);
            input.addEventListener('keyup', onEnter);
        });
    }

    function maskAuthorName(name) {
        if (!name) return '익명';
        const trimmed = name.trim();
        if (trimmed.length <= 1) return trimmed;
        if (trimmed.length === 2) return trimmed[0] + '*';
        return trimmed[0] + '*'.repeat(trimmed.length - 1);
    }

    function getPosts() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    function savePosts(posts) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    }

    let currentActivePostId = null;
    let isEditingPostId = null;

    // 카테고리 탭 (UI 처리)
    const catBtns = document.querySelectorAll('.board-cat-btn');
    if (catBtns.length > 0) {
        catBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                catBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderPosts(btn.textContent.trim());
            });
        });
    }

    // 커스텀 셀렉트 로직
    const customSelect = document.getElementById('customCategorySelect');
    const hiddenInput = document.getElementById('postCategory');
    const textSpan = document.querySelector('.custom-select-text');
    const options = document.querySelectorAll('.custom-option');

    if (customSelect && hiddenInput && textSpan && options.length > 0) {
        customSelect.querySelector('.custom-select-trigger').addEventListener('click', (e) => {
            e.stopPropagation();
            customSelect.classList.toggle('open');
        });

        options.forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                const val = opt.getAttribute('data-value');
                options.forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                hiddenInput.value = val;
                textSpan.textContent = val;
                customSelect.classList.remove('open');
                
                const postIsSecretElem = document.getElementById('postIsSecret');
                if (val === '문의') {
                    postIsSecretElem.checked = true;
                    postIsSecretElem.disabled = true;
                } else {
                    postIsSecretElem.disabled = false;
                }
            });
        });

        document.addEventListener('click', () => {
            customSelect.classList.remove('open');
        });
    }

    // 모달 및 폼 요소
    const writeModal = document.getElementById('writeModal');
    const writeBtn = document.querySelector('.board-write-btn');
    const closeWriteModal = document.getElementById('closeWriteModal');
    const cancelWriteModal = document.getElementById('cancelWriteModal');
    const writeForm = document.getElementById('writeForm');

    const detailModal = document.getElementById('detailModal');
    const closeDetailModal = document.getElementById('closeDetailModal');
    const confirmDetailModal = document.getElementById('confirmDetailModal');
    const btnEditPost = document.getElementById('btnEditPost');
    const btnDeletePost = document.getElementById('btnDeletePost');
    const commentForm = document.getElementById('commentForm');
    const authorInputGroup = document.getElementById('authorInputGroup');
    const passwordInputGroup = document.getElementById('passwordInputGroup');
    const commentAuthGroup = document.getElementById('commentAuthGroup');

    function hideDetailModal() {
        if (detailModal) detailModal.classList.remove('active');
        currentActivePostId = null;
    }

    if (closeDetailModal) closeDetailModal.addEventListener('click', hideDetailModal);
    if (confirmDetailModal) confirmDetailModal.addEventListener('click', hideDetailModal);

    // 폼 UI 상태 업데이트 (관리자 모드 반영)
    function updateFormVisibility() {
        if (isAdminSession) {
            if (authorInputGroup) authorInputGroup.style.display = 'none';
            if (passwordInputGroup) passwordInputGroup.style.display = 'none';
            if (commentAuthGroup) commentAuthGroup.style.display = 'none';
            document.getElementById('postAuthor').removeAttribute('required');
            document.getElementById('postPassword').removeAttribute('required');
            document.getElementById('commentAuthor').removeAttribute('required');
        } else {
            if (authorInputGroup) authorInputGroup.style.display = 'block';
            if (passwordInputGroup) passwordInputGroup.style.display = 'block';
            if (commentAuthGroup) commentAuthGroup.style.display = 'flex';
            document.getElementById('postAuthor').setAttribute('required', 'required');
            document.getElementById('postPassword').setAttribute('required', 'required');
            document.getElementById('commentAuthor').setAttribute('required', 'required');
        }
    }

    if (writeBtn && writeModal) {
        writeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            isEditingPostId = null;
            const titleEl = document.querySelector('#writeModal .modal-title');
            if(titleEl) titleEl.textContent = '✏️ 새 글 작성';
            
            updateFormVisibility();
            if (writeForm) writeForm.reset();

            if (options && hiddenInput && textSpan) {
                options.forEach(opt => {
                    const val = opt.getAttribute('data-value');
                    if (isAdminSession) {
                        opt.style.display = 'block';
                    } else {
                        opt.style.display = (val === '공지' || val === '공지사항') ? 'none' : 'block';
                    }
                });
                const defaultCat = isAdminSession ? '공지' : '문의';
                hiddenInput.value = defaultCat;
                textSpan.textContent = defaultCat;
                options.forEach(o => {
                    o.classList.remove('selected');
                    if (o.getAttribute('data-value') === defaultCat) o.classList.add('selected');
                });
                const postIsSecretElem = document.getElementById('postIsSecret');
                if (defaultCat === '문의') {
                    postIsSecretElem.checked = true;
                    postIsSecretElem.disabled = true;
                } else {
                    postIsSecretElem.disabled = false;
                }
            }
            writeModal.classList.add('active');
        });
    }

    function hideWriteModal() {
        if (writeModal) {
            writeModal.classList.remove('active');
            isEditingPostId = null;
            if (writeForm) writeForm.reset();
        }
    }

    if (closeWriteModal) closeWriteModal.addEventListener('click', hideWriteModal);
    if (cancelWriteModal) cancelWriteModal.addEventListener('click', hideWriteModal);

    // 게시글 등록/수정 Submit
    if (writeForm) {
        writeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const category = document.getElementById('postCategory').value;
            let isSecret = document.getElementById('postIsSecret').checked;
            if (category === '문의') {
                isSecret = true;
            }
            const title = document.getElementById('postTitle').value.trim();
            const content = document.getElementById('postContent').value.trim();

            let authorRaw, password, authorMasked;

            if (isAdminSession) {
                authorRaw = '팜이오 관리자';
                authorMasked = '팜이오 (관리자)';
                password = 'admin'; // 더미 패스워드
            } else {
                authorRaw = document.getElementById('postAuthor').value.trim();
                password = document.getElementById('postPassword').value.trim();
                authorMasked = (category === '공지' || category === '공지사항') ? `${authorRaw} (관리자)` : maskAuthorName(authorRaw);

                if (!authorRaw || !password || !title || !content) {
                    alert('모든 입력란을 작성해주세요!');
                    return;
                }
            }

            if (!isAdminSession && (category === '공지' || category === '공지사항')) {
                alert('공지 카테고리는 관리자만 작성하실 수 있습니다.');
                return;
            }

            const posts = getPosts();

            if (isEditingPostId) {
                const targetPost = posts.find(p => p.id === isEditingPostId);
                if (targetPost) {
                    targetPost.category = category;
                    targetPost.title = title;
                    targetPost.content = content;
                    targetPost.isSecret = isSecret;
                    // 작성자/비밀번호는 본인 혹은 관리자가 수정한 것이므로 업데이트
                    targetPost.authorRaw = authorRaw;
                    targetPost.authorMasked = authorMasked;
                    targetPost.password = password;
                    
                    savePosts(posts);
                    hideWriteModal();
                    hideDetailModal();
                    renderPosts();
                    openPostDetail(targetPost.id); // 수정 후 상세보기 열기
                    return;
                }
            }

            const newId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;
            const now = new Date();
            const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

            const newPost = {
                id: newId,
                category: category,
                title: title,
                content: content,
                authorRaw: authorRaw,
                authorMasked: authorMasked,
                password: password,
                isSecret: isSecret,
                date: dateStr,
                views: 0,
                comments: []
            };

            posts.unshift(newPost);
            savePosts(posts);
            if(!isAdminSession) {
                myPosts.push(newId);
                saveMyPosts();
            }
            
            hideWriteModal();
            renderPosts();
        });
    }

    // 관리자 버튼
    const btnAdminLogin = document.getElementById('btnAdminLogin');
    function updateAdminButtonUI() {
        if (!btnAdminLogin) return;
        if (isAdminSession) {
            btnAdminLogin.textContent = '관리자 로그아웃';
            btnAdminLogin.style.backgroundColor = '#1b4535';
            btnAdminLogin.style.color = '#fff';
            btnAdminLogin.style.borderColor = '#1b4535';
        } else {
            btnAdminLogin.textContent = '관리자 인증';
            btnAdminLogin.style.backgroundColor = '#f1f5f3';
            btnAdminLogin.style.color = '#444';
            btnAdminLogin.style.borderColor = '#dcdfdc';
        }
        updateFormVisibility();
    }

    if (btnAdminLogin) {
        updateAdminButtonUI();
        btnAdminLogin.addEventListener('click', async () => {
            if (isAdminSession) {
                if (confirm('관리자 모드를 종료하시겠습니까?')) {
                    sessionStorage.removeItem('farmio_admin_logged');
                    isAdminSession = false;
                    updateAdminButtonUI();
                    renderPosts();
                    if(currentActivePostId) hideDetailModal();
                }
            } else {
                const pwd = await promptPasswordModal('관리자 비밀번호를 입력하세요:', 'admin1234');
                if (pwd !== null) {
                    sessionStorage.setItem('farmio_admin_logged', 'true');
                    isAdminSession = true;
                    updateAdminButtonUI();
                    renderPosts();
                }
            }
        });
    }

    let currentPage = 1;
    const postsPerPage = 10;

    window.renderPosts = function(filterCat = '전체', searchTerm = '') {
        const posts = getPosts();
        let filtered = posts;
        if (filterCat !== '전체') filtered = filtered.filter(p => p.category === filterCat);
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            filtered = filtered.filter(p => 
                p.title.toLowerCase().includes(lower) || 
                p.content.toLowerCase().includes(lower) ||
                (p.authorRaw && p.authorRaw.toLowerCase().includes(lower))
            );
        }

        filtered.sort((a, b) => {
            const aIsNotice = (a.category === '공지' || a.category === '공지사항');
            const bIsNotice = (b.category === '공지' || b.category === '공지사항');
            if (aIsNotice && !bIsNotice) return -1;
            if (!aIsNotice && bIsNotice) return 1;
            return b.id - a.id;
        });

        boardTableBody.innerHTML = '';
        if (filtered.length === 0) {
            boardTableBody.innerHTML = `<tr><td colspan="6" class="board-empty-row">등록된 게시글이 없습니다.</td></tr>`;
            const paginationContainer = document.querySelector('.pagination');
            if(paginationContainer) paginationContainer.innerHTML = '';
            return;
        }

        const totalPages = Math.ceil(filtered.length / postsPerPage);
        if (currentPage > totalPages) currentPage = totalPages || 1;
        const startIndex = (currentPage - 1) * postsPerPage;
        const paginatedPosts = filtered.slice(startIndex, startIndex + postsPerPage);

        paginatedPosts.forEach(post => {
            const tr = document.createElement('tr');
            let titleHtml = post.title;
            if (post.isSecret) titleHtml = `🔒 ${titleHtml}`;
            
            let isNew = false;
            if (post.date) {
                const parts = post.date.split('.');
                if (parts.length === 3) {
                    const postDateObj = new Date(parts[0], parts[1]-1, parts[2]);
                    const diffDays = (new Date() - postDateObj) / (1000 * 60 * 60 * 24);
                    if (diffDays <= 2 && diffDays >= -1) isNew = true;
                }
            }
            if (isNew) titleHtml += ` <span class="new-badge" style="color:#e74c3c; font-size:0.8rem; font-weight:bold; margin-left:5px;">N</span>`;
            
            const commentCount = post.comments && post.comments.length > 0 ? ` <span class="comment-count-badge">[${post.comments.length}]</span>` : '';
            
            const displayAuthor = isAdminSession ? post.authorRaw : post.authorMasked;
            // 관리자 작성글 스타일 다르게
            const trStyle = (post.authorRaw === '팜이오 관리자') ? 'background-color: #f8fbfa; font-weight: 500;' : '';

            tr.innerHTML = `
                <td style="${trStyle}">${post.id}</td>
                <td style="${trStyle}"><span class="board-badge badge-${getBadgeClass(post.category)}">${post.category}</span></td>
                <td class="col-title-td" style="${trStyle}">
                    <a href="#" class="board-title-link" data-id="${post.id}">${titleHtml}${commentCount}</a>
                </td>
                <td style="${trStyle}">${displayAuthor}</td>
                <td style="${trStyle}">${post.date}</td>
                <td style="${trStyle}">${post.views || 0}</td>
            `;
            boardTableBody.appendChild(tr);
        });

        document.querySelectorAll('.board-title-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                openPostDetail(parseInt(link.getAttribute('data-id')));
            });
        });

        const paginationContainer = document.querySelector('.pagination');
        if (paginationContainer) {
            paginationContainer.innerHTML = '';
            
            const prevLink = document.createElement('a');
            prevLink.href = '#';
            prevLink.className = 'page-link';
            prevLink.innerHTML = '&lt;';
            prevLink.onclick = (e) => { e.preventDefault(); if(currentPage > 1) { currentPage--; renderPosts(filterCat, searchTerm); } };
            paginationContainer.appendChild(prevLink);
            
            for (let i = 1; i <= totalPages; i++) {
                const pLink = document.createElement('a');
                pLink.href = '#';
                pLink.className = 'page-link' + (i === currentPage ? ' active' : '');
                pLink.textContent = i;
                pLink.onclick = (e) => { e.preventDefault(); currentPage = i; renderPosts(filterCat, searchTerm); };
                paginationContainer.appendChild(pLink);
            }
            
            const nextLink = document.createElement('a');
            nextLink.href = '#';
            nextLink.className = 'page-link';
            nextLink.innerHTML = '&gt;';
            nextLink.onclick = (e) => { e.preventDefault(); if(currentPage < totalPages) { currentPage++; renderPosts(filterCat, searchTerm); } };
            paginationContainer.appendChild(nextLink);
        }
    }

    function getBadgeClass(cat) {
        if (cat === '공지' || cat === '공지사항') return 'notice';
        if (cat === '문의') return 'qna';
        if (cat === '체험후기') return 'review';
        return 'free';
    }

    window.openPostDetail = async function(id) {
        const posts = getPosts();
        const post = posts.find(p => p.id === id);
        if (!post) return;

        // 비밀글 체크
        if (post.isSecret && !isAdminSession) {
            const pwd = await promptPasswordModal('🔒 비밀글입니다. 비밀번호를 입력해주세요.', post.password);
            if (pwd === null) return;
        }

        post.views = (post.views || 0) + 1;
        savePosts(posts);

        document.getElementById('detailCategory').textContent = post.category;
        document.getElementById('detailTitle').textContent = post.title;
        document.getElementById('detailAuthor').textContent = isAdminSession ? post.authorRaw : post.authorMasked;
        document.getElementById('detailDate').textContent = post.date;
        document.getElementById('detailViews').textContent = post.views;
        document.getElementById('detailContent').innerHTML = post.content.replace(/\n/g, '<br>');

        currentActivePostId = id;
        
        const isMyPost = Array.isArray(myPosts) && myPosts.includes(post.id);
        const btnEditPost = document.getElementById('btnEditPost');
        const btnDeletePost = document.getElementById('btnDeletePost');
        if (isAdminSession) {
            if(btnEditPost) btnEditPost.style.display = 'inline-block';
            if(btnDeletePost) btnDeletePost.style.display = 'inline-block';
        } else {
            if(btnEditPost) btnEditPost.style.display = 'none';
            if(btnDeletePost) btnDeletePost.style.display = 'none';
        }
        
        // 내 글이거나 관리자면 수정/삭제 버튼 표시, 아니면 기본 노출 후 비밀번호 검사
        // 디자인 향상을 위해 공지사항 댓글 폼 숨기기
        const commentFormContainer = document.getElementById('commentForm');
        let existNotice = document.getElementById('noticeCommentInfo');
        if (existNotice) existNotice.remove();

        if (post.category === '공지' || post.category === '공지사항' || post.category === '체험후기') {
            commentFormContainer.style.display = 'none';
            const notice = document.createElement('div');
            notice.id = 'noticeCommentInfo';
            notice.className = 'notice-comment-info';
            notice.textContent = '💡 이 글에는 댓글을 작성할 수 없습니다.';
            commentFormContainer.parentNode.insertBefore(notice, commentFormContainer);
        } else {
            commentFormContainer.style.display = 'flex';
            updateFormVisibility();
            
            const commentAuthGroup = document.getElementById('commentAuthGroup');
            const commentAuthorInput = document.getElementById('commentAuthor');
            if (isAdminSession) {
                if(commentAuthGroup) commentAuthGroup.style.display = 'none';
                if(commentAuthorInput) commentAuthorInput.value = '팜이오 관리자';
            } else if (isMyPost) {
                if(commentAuthGroup) commentAuthGroup.style.display = 'none';
                if(commentAuthorInput) commentAuthorInput.value = post.authorRaw;
            } else {
                if(commentAuthGroup) commentAuthGroup.style.display = 'flex';
                if(commentAuthorInput) commentAuthorInput.value = '';
            }
        }

        renderComments(post.id);
        detailModal.classList.add('active');
    }

    function renderComments(postId) {
        const posts = getPosts();
        const post = posts.find(p => p.id === postId);
        if (!post) return;

        const commentsList = document.getElementById('commentsList');
        document.getElementById('commentCount').textContent = `(${post.comments ? post.comments.length : 0})`;
        commentsList.innerHTML = '';

        if (!post.comments || post.comments.length === 0) {
            commentsList.innerHTML = `<div style="color:#888; font-size:0.92rem; text-align:center; padding:15px 0;">등록된 댓글이 없습니다. 첫 댓글을 남겨보세요!</div>`;
            return;
        }

        post.comments.forEach((comment, idx) => {
            const div = document.createElement('div');
            div.className = 'comment-item';
            
            
            const displayAuthor = isAdminSession ? comment.authorRaw : comment.authorMasked;
            const authorStyle = (comment.authorRaw === '팜이오 관리자') ? 'color:#1b4535; font-weight:800;' : 'color:#2c3e50; font-weight:700;';

            const isMyComment = Array.isArray(myComments) && myComments.includes(comment.id);

            div.innerHTML = `
                <div class="comment-item-header">
                    <strong class="comment-item-author" style="${authorStyle}">${displayAuthor}</strong>
                    <div class="comment-item-actions">
                        <span class="comment-item-date">${comment.date}</span>
                        ${(isAdminSession || isMyComment) ? 
                        `<button type="button" onclick="openInlineEdit(${post.id}, ${idx}, this.parentNode.parentNode.parentNode)" class="btn-comment-edit">수정</button>
                        <button type="button" onclick="deleteComment(${post.id}, ${idx})" class="btn-comment-delete">삭제</button>` : ''}
                    </div>
                </div>
                <div class="comment-text-content">${comment.text.replace(/\n/g, '<br>')}</div>
            `;
            commentsList.appendChild(div);
        });
    }

    // 댓글 인라인 수정 UI 열기
    window.openInlineEdit = async function(postId, idx, commentDiv) {
        const posts = getPosts();
        const post = posts.find(p => p.id === postId);
        if(!post || !post.comments[idx]) return;
        const comment = post.comments[idx];

        const contentDiv = commentDiv.querySelector('.comment-text-content');
        const originalText = comment.text;
        
        if (!isAdminSession && !(Array.isArray(myComments) && myComments.includes(comment.id))) {
            const pwd = await promptPasswordModal('🔒 댓글 수정을 위해 비밀번호를 입력하세요.', comment.password);
            if (pwd === null) return;
        }
        
        contentDiv.innerHTML = `
            <div class="inline-edit-form">
                <input type="text" id="inlineEdit_${idx}" value="${originalText.replace(/"/g, '&quot;')}" class="inline-edit-input">
                <button type="button" onclick="saveInlineEdit(${postId}, ${idx})" class="btn-inline-save">완료</button>
                <button type="button" onclick="cancelInlineEdit(${postId})" class="btn-inline-cancel">취소</button>
            </div>
        `;
        document.getElementById(`inlineEdit_${idx}`).focus();
    };

    window.saveInlineEdit = function(postId, idx) {
        const input = document.getElementById(`inlineEdit_${idx}`);
        if(!input) return;
        const newText = input.value.trim();
        if(!newText) {
            alert('내용을 입력해주세요.');
            return;
        }

        const posts = getPosts();
        const post = posts.find(p => p.id === postId);
        if(post && post.comments[idx]) {
            post.comments[idx].text = newText;
            savePosts(posts);
            renderComments(postId);
            renderPosts();
        }
    };

    window.cancelInlineEdit = function(postId) {
        renderComments(postId);
    };

    window.deleteComment = async function(postId, idx) {
        const posts = getPosts();
        const post = posts.find(p => p.id === postId);
        if(!post || !post.comments[idx]) return;

        const comment = post.comments[idx];
        
        if (isAdminSession) {
            if (confirm('💡 [관리자 권한] 이 댓글을 삭제하시겠습니까?')) {
                post.comments.splice(idx, 1);
                savePosts(posts);
                renderComments(postId);
                renderPosts();
            }
            return;
        }

        const pwd = await promptPasswordModal('🔒 댓글 삭제를 위해 비밀번호를 입력하세요.', comment.password);
        if (pwd === null) return;

        if (confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
            post.comments.splice(idx, 1);
            savePosts(posts);
            renderComments(postId);
            renderPosts();
        }
    };

    // 댓글 등록
    if (commentForm) {
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!currentActivePostId) return;

            const posts = getPosts();
            const post = posts.find(p => p.id === currentActivePostId);
            if (!post) return;

            const cText = document.getElementById('commentText').value.trim();
            if (!cText) {
                alert('댓글 내용을 입력해주세요.');
                return;
            }

            let cAuthorRaw, cPassword, cAuthorMasked;
            const isMyPost = Array.isArray(myPosts) && myPosts.includes(post.id);

            if (isAdminSession) {
                cAuthorRaw = '팜이오 관리자';
                cAuthorMasked = '팜이오 (관리자)';
            } else if (isMyPost) {
                cAuthorRaw = post.authorRaw;
                cAuthorMasked = maskAuthorName(post.authorRaw);
            } else {
                cAuthorRaw = document.getElementById('commentAuthor').value.trim();
                if (!cAuthorRaw) {
                    alert('작성자를 입력해주세요.');
                    return;
                }
                cAuthorMasked = maskAuthorName(cAuthorRaw);
            }

            const now = new Date();
            const dateStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`;
            const newCommentId = Date.now(); // 고유 ID 부여 (세션 확인용)

            const newComment = {
                id: newCommentId,
                authorRaw: cAuthorRaw,
                authorMasked: cAuthorMasked,
                password: post.password, // 글 작성시 입력한 비밀번호와 동일하게
                text: cText,
                date: dateStr
            };

            if (!post.comments) post.comments = [];
            post.comments.push(newComment);
            savePosts(posts);

            if(!isAdminSession) {
                myComments.push(newCommentId);
                saveMyComments();
            }

            renderComments(currentActivePostId);
            renderPosts();
            
            // 입력창 초기화
            document.getElementById('commentText').value = '';
            if(!isAdminSession) {
                document.getElementById('commentAuthor').value = '';
            }
        });
    }

    // 게시글 수정
    if (btnEditPost) {
        btnEditPost.addEventListener('click', async () => {
            if (!currentActivePostId) return;
            const posts = getPosts();
            const post = posts.find(p => p.id === currentActivePostId);
            if (!post) return;

            if (!isAdminSession) {
                const pwd = await promptPasswordModal('🔒 게시글 수정을 위해 비밀번호를 입력하세요.', post.password);
                if (pwd === null) return;
            }

            isEditingPostId = post.id;
            document.querySelector('#writeModal .modal-title').textContent = '✏️ 글 수정';
            updateFormVisibility();
            
            document.getElementById('postCategory').value = post.category;
            document.querySelector('.custom-select-text').textContent = post.category;
            document.querySelectorAll('.custom-option').forEach(o => {
                o.classList.remove('selected');
                if (o.getAttribute('data-value') === post.category) o.classList.add('selected');
            });
            const postIsSecretElem = document.getElementById('postIsSecret');
            if (post.category === '문의') {
                postIsSecretElem.checked = true;
                postIsSecretElem.disabled = true;
            } else {
                postIsSecretElem.disabled = false;
            }

            if (!isAdminSession) {
                document.getElementById('postAuthor').value = post.authorRaw;
                document.getElementById('postPassword').value = post.password;
            }
            document.getElementById('postIsSecret').checked = !!post.isSecret;
            document.getElementById('postTitle').value = post.title;
            document.getElementById('postContent').value = post.content;

            writeModal.classList.add('active');
        });
    }

    // 게시글 삭제
    if (btnDeletePost) {
        btnDeletePost.addEventListener('click', async () => {
            if (!currentActivePostId) return;
            const posts = getPosts();
            const postIndex = posts.findIndex(p => p.id === currentActivePostId);
            if (postIndex === -1) return;

            if (isAdminSession) {
                if (confirm('💡 [관리자 권한] 이 게시글을 삭제하시겠습니까?')) {
                    posts.splice(postIndex, 1);
                    savePosts(posts);
                    hideDetailModal();
                    renderPosts();
                }
                return;
            }

            const pwd = await promptPasswordModal('🔒 게시글 삭제를 위해 비밀번호를 입력하세요.', posts[postIndex].password);
            if (pwd === null) return;

            if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
                posts.splice(postIndex, 1);
                savePosts(posts);
                hideDetailModal();
                renderPosts();
            }
        });
    }

    const searchInput = document.querySelector('.board-search-input');
    const searchBtn = document.querySelector('.board-search-btn');

    function handleSearch() {
        if (!searchInput) return;
        const term = searchInput.value.trim();
        const activeCatBtn = document.querySelector('.board-cat-btn.active');
        const currentCat = activeCatBtn ? activeCatBtn.textContent.trim() : '전체';
        renderPosts(currentCat, term);
    }

    if (searchBtn) searchBtn.addEventListener('click', handleSearch);
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
    }

    renderPosts();
});