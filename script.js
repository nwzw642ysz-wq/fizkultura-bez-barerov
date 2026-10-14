
'use strict';
const app=document.getElementById('app');
const tests=window.QUIZ_DATA;
let state=null;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const letters=['А','Б','В','Г'];
function url(id){return new URL('index.html?test='+id,location.href).href}
function home(){
 state=null;document.title='Физкультура без барьеров — тесты';
 app.innerHTML=`<section class="hero"><div class="eyebrow">Интерактивный учебный комплекс</div><h1>Физкультура<br>без барьеров</h1><p>Выберите тему и проверьте знания. В каждом тесте — 20 вопросов, один правильный ответ и автоматический подсчёт баллов. Тест можно проходить сколько угодно раз.</p><span class="pill">6 тем</span> <span class="pill">120 вопросов</span> <span class="pill">Результат сразу</span></section><section class="grid">${tests.map(t=>`<article class="card"><div class="number">${String(t.id).padStart(2,'0')}</div><h2>${esc(t.title)}</h2><p>20 вопросов · примерно 10–15 минут</p><a class="btn" href="?test=${t.id}">Начать тест →</a><div class="linkbox">Отдельная ссылка: <button class="btn secondary" data-copy="${t.id}" type="button">Скопировать</button></div></article>`).join('')}</section><p class="notice">Ответы проверяются прямо в браузере. Сайт не отправляет результаты преподавателю автоматически. После завершения студент может скачать отчёт и передать его преподавателю.</p>`;
 app.querySelectorAll('[data-copy]').forEach(b=>b.addEventListener('click',async()=>{const link=url(b.dataset.copy);try{await navigator.clipboard.writeText(link);b.textContent='Скопировано ✓'}catch{window.prompt('Скопируйте ссылку:',link)}}));
}
function start(id){const t=tests.find(x=>x.id===id);if(!t){home();return}state={test:t,answers:Array(20).fill(null),index:0,student:'',group:''};document.title=t.title+' — Физкультура без барьеров';renderQuestion()}
function renderQuestion(){
 const {test:t,index:i,answers}=state,q=t.questions[i],n=i+1;
 app.innerHTML=`<a class="back" href="./">← Все темы</a><div class="panel"><div class="row between"><span class="pill">${esc(t.title)}</span><strong>Вопрос ${n} из 20</strong></div><div class="progress" role="progressbar" aria-label="Прогресс теста" aria-valuenow="${n}" aria-valuemin="1" aria-valuemax="20"><div style="width:${n*5}%"></div></div><div class="question">${esc(q.text)}</div><fieldset style="border:0;padding:0;margin:0"><legend class="muted" style="margin-bottom:12px">Выберите один правильный ответ</legend><div class="options">${q.options.map((o,k)=>`<label class="option ${answers[i]===k?'selected':''}"><input type="radio" name="answer" value="${k}" ${answers[i]===k?'checked':''}><span><b>${letters[k]}.</b> ${esc(o)}</span></label>`).join('')}</div></fieldset><div class="actions"><button class="btn secondary" id="prev" ${i===0?'disabled':''}>← Назад</button><button class="btn" id="next" ${answers[i]===null?'disabled':''}>${i===19?'Завершить тест':'Следующий вопрос →'}</button></div></div>`;
 app.querySelectorAll('input[name=answer]').forEach(r=>r.addEventListener('change',()=>{answers[i]=Number(r.value);renderQuestion()}));
 app.querySelector('#prev').onclick=()=>{if(i>0){state.index--;renderQuestion()}};
 app.querySelector('#next').onclick=()=>{if(answers[i]===null)return;if(i===19)finish();else{state.index++;renderQuestion()}};
}
function finish(){
 const {test:t,answers}=state;
 const score=t.questions.reduce((a,q,i)=>a+(answers[i]===q.correct?1:0),0);
 state.score=score;
 app.innerHTML=`<a class="back" href="./">← Все темы</a><section class="panel"><div class="eyebrow">Тест завершён</div><h1>Ваш результат</h1><h2>${esc(t.title)}</h2><div class="score">${score} / 20</div><p>${Math.round(score/20*100)}% правильных ответов</p><p class="notice">Для подтверждения прохождения укажите ФИО и группу и скачайте отчёт. Данные останутся только в скачанном файле, автоматически преподавателю они не отправляются.</p><label class="field"><span>Фамилия, имя, отчество</span><input id="student" autocomplete="name" placeholder="Иванов Иван Иванович" maxlength="120"></label><label class="field"><span>Группа</span><input id="group" placeholder="Например, КИП-301" maxlength="60"></label><div class="actions"><button class="btn" id="download">Скачать результат (.txt)</button><button class="btn secondary" id="retry">Пройти ещё раз</button></div></section><section class="panel"><h2>Разбор ответов</h2>${t.questions.map((q,i)=>`<div class="review"><h3>${i+1}. ${esc(q.text)}</h3><p class="${answers[i]===q.correct?'ok':'bad'}">${answers[i]===q.correct?'✓ Верно':'✕ Неверно'}</p><p>Ваш ответ: ${esc(q.options[answers[i]])}</p>${answers[i]!==q.correct?`<p><b>Правильный ответ:</b> ${esc(q.options[q.correct])}</p>`:''}</div>`).join('')}</section>`;
 document.querySelector('#retry').onclick=()=>start(t.id);
 document.querySelector('#download').onclick=()=>{const name=document.querySelector('#student').value.trim(),group=document.querySelector('#group').value.trim();if(!name||!group){alert('Для отчёта заполните ФИО и группу.');return}const date=new Date().toLocaleString('ru-RU');const lines=[`ФИЗКУЛЬТУРА БЕЗ БАРЬЕРОВ`,`Тема: ${t.title}`,`Студент: ${name}`,`Группа: ${group}`,`Дата (по устройству студента): ${date}`,`Результат: ${score} из 20 (${Math.round(score/20*100)}%)`,'',...t.questions.flatMap((q,i)=>[`${i+1}. ${q.text}`,`Ответ: ${letters[answers[i]]}. ${q.options[answers[i]]}`,`Правильно: ${answers[i]===q.correct?'Да':'Нет'}`,''])];const blob=new Blob(['\ufeff'+lines.join('\r\n')],{type:'text/plain;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`rezultat_test_${t.id}.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),3000)};
}
const id=Number(new URLSearchParams(location.search).get('test'));
if(Number.isInteger(id)&&id>=1&&id<=6)start(id);else home();
