import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../store/theme/ThemeContext';
import { FiMail, FiPhone, FiMapPin, FiSend, FiFacebook, FiTwitter, FiLinkedin, FiInstagram, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const SUBJECTS = ['General Enquiry','Technical Support','Billing & Payments','Partnership Opportunity','School / Institution Pricing','Press & Media','Other'];
const SOCIALS  = [
  { href:'https://www.linkedin.com/in/mekuanit-misganaw-b0aa16384/', icon:FiLinkedin,  label:'LinkedIn',  color:'#0a66c2' },
  { href:'https://t.me/mismarkol',                                     icon:FiSend,      label:'Telegram',  color:'#229ed9' },
  { href:'#facebook',                                                  icon:FiFacebook,  label:'Facebook',  color:'#1877f2' },
  { href:'#twitter',                                                   icon:FiTwitter,   label:'Twitter',   color:'#1da1f2' },
  { href:'#instagram',                                                 icon:FiInstagram, label:'Instagram', color:'#e1306c' },
];
const CONTACT_INFO = [
  { icon:FiMail,   grad:'from-blue-500 to-indigo-600',  glow:'rgba(59,130,246,0.35)',  label:'Email',    value:'info@lihiket.com',     href:'mailto:info@lihiket.com' },
  { icon:FiPhone,  grad:'from-emerald-500 to-teal-600', glow:'rgba(16,185,129,0.35)',  label:'Phone',    value:'+251 918 854 070',      href:'tel:+251918854070' },
  { icon:FiMapPin, grad:'from-amber-500 to-orange-600', glow:'rgba(245,158,11,0.35)',  label:'Location', value:'Addis Ababa, Ethiopia', href:null },
];

export default function ContactPage() {
  const {theme}=useTheme();
  const dark=theme==='dark';
  const bg   = dark?'linear-gradient(135deg,#020817 0%,#0a0f1e 50%,#020817 100%)':'#f8fafc';
  const txt  = dark?'#ffffff':'#0f172a';
  const sub  = dark?'#94a3b8':'#475569';
  const bd   = dark?'1px solid rgba(255,255,255,0.06)':'1px solid rgba(0,0,0,0.07)';
  const inputBg = dark?'rgba(255,255,255,0.05)':'#ffffff';
  const inputBd = dark?'1px solid rgba(255,255,255,0.1)':'1px solid rgba(0,0,0,0.1)';
  const cardBg  = dark?'rgba(255,255,255,0.03)':'#ffffff';
  const cardBd  = dark?'1px solid rgba(255,255,255,0.07)':'1px solid rgba(0,0,0,0.08)';

  const [form,setForm]      = useState({name:'',email:'',subject:SUBJECTS[0],message:''});
  const [errors,setErrors]  = useState({});
  const [status,setStatus]  = useState(null);
  const [sending,setSending] = useState(false);

  function validate(){
    const e={};
    if(!form.name.trim())    e.name='Name is required.';
    if(!form.email.trim())   e.email='Email is required.';
    else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email='Enter a valid email address.';
    if(!form.message.trim()) e.message='Message is required.';
    else if(form.message.trim().length<20) e.message='Message must be at least 20 characters.';
    return e;
  }
  function handleSet(field){ return val=>{ setForm(f=>({...f,[field]:val})); if(errors[field]) setErrors(e=>{const n={...e};delete n[field];return n;}); }; }
  async function handleSubmit(e){
    e.preventDefault();
    const errs=validate();
    if(Object.keys(errs).length>0){setErrors(errs);return;}
    setSending(true);
    await new Promise(r=>setTimeout(r,1200));
    setSending(false); setStatus('success');
    setForm({name:'',email:'',subject:SUBJECTS[0],message:''});
  }

  return (
    <div style={{background:bg,minHeight:'100vh'}}>

      <section className="relative overflow-hidden pt-24 pb-16 px-4">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div style={{position:'absolute',top:'-10%',left:'-5%',width:560,height:560,borderRadius:'50%',background:'radial-gradient(circle,rgba(16,185,129,0.1) 0%,transparent 70%)',filter:'blur(40px)'}}/>
          <div style={{position:'absolute',bottom:'-10%',right:'-5%',width:480,height:480,borderRadius:'50%',background:'radial-gradient(circle,rgba(59,130,246,0.1) 0%,transparent 70%)',filter:'blur(40px)'}}/>
        </div>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <motion.div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-6 text-sm font-semibold"
            style={{background:'rgba(16,185,129,0.12)',border:'1px solid rgba(16,185,129,0.35)',color:'#10b981'}}
            initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.6}}>
            <motion.div className="w-2 h-2 rounded-full bg-emerald-500" animate={{scale:[1,1.4,1]}} transition={{duration:1.5,repeat:Infinity}}/>
            Contact Us
          </motion.div>
          <motion.h1 className="font-black leading-tight mb-4" style={{fontSize:'clamp(2.2rem,6vw,3.8rem)',color:txt}}
            initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.7,delay:0.1}}>
            We'd love to{' '}
            <span style={{background:'linear-gradient(90deg,#34d399,#60a5fa)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>hear from you</span>
          </motion.h1>
          <motion.p className="text-lg leading-relaxed" style={{color:sub}}
            initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.7,delay:0.2}}>
            Have a question, feedback, or partnership idea? We'll get back to you within 24 hours.
          </motion.p>
          <motion.div className="flex items-center justify-center gap-2 text-sm mt-6" style={{color:sub}}
            initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5}}>
            <Link to="/" className="hover:text-emerald-500 transition-colors">Home</Link>
            <span>/</span><span className="text-emerald-500">Contact</span>
          </motion.div>
        </div>
      </section>

      <section className="px-4 pb-24" style={{borderTop:bd}}>
        <div className="max-w-5xl mx-auto pt-12 grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* Left */}
          <motion.div className="lg:col-span-2 space-y-5"
            initial={{opacity:0,x:-30}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{duration:0.7}}>

            {CONTACT_INFO.map(({icon:Icon,grad,glow,label,value,href})=>(
              <div key={label} className="flex items-start gap-4 p-5 rounded-2xl" style={{background:cardBg,border:cardBd,boxShadow:dark?'none':'0 1px 4px rgba(0,0,0,0.05)'}}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${grad}`} style={{boxShadow:`0 0 18px ${glow}`}}>
                  <Icon className="w-5 h-5 text-white"/>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{color:sub}}>{label}</p>
                  {href
                    ?<a href={href} className="font-semibold text-sm hover:text-emerald-500 transition-colors" style={{color:txt}}>{value}</a>
                    :<p className="font-semibold text-sm" style={{color:txt}}>{value}</p>}
                </div>
              </div>
            ))}

            <div className="p-5 rounded-2xl" style={{background:cardBg,border:cardBd}}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{color:sub}}>Support Hours (EAT)</p>
              {[{day:'Mon – Fri',hours:'8:00 AM – 6:00 PM'},{day:'Saturday',hours:'9:00 AM – 3:00 PM'},{day:'Sunday',hours:'Closed'}].map(({day,hours})=>(
                <div key={day} className="flex justify-between py-2 border-b last:border-none text-sm" style={{borderColor:dark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.07)'}}>
                  <span style={{color:sub}}>{day}</span>
                  <span className="font-semibold" style={{color:hours==='Closed'?sub:txt}}>{hours}</span>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{color:sub}}>Follow Us</p>
              <div className="flex items-center gap-2 flex-wrap">
                {SOCIALS.map(({href,icon:Icon,label,color})=>(
                  <a key={label} href={href} target={href.startsWith('http')?'_blank':undefined} rel={href.startsWith('http')?'noopener noreferrer':undefined} aria-label={label}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                    style={{background:dark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)',border:dark?'1px solid rgba(255,255,255,0.08)':'1px solid rgba(0,0,0,0.08)'}}
                    onMouseEnter={e=>{e.currentTarget.style.background=`${color}22`;e.currentTarget.style.borderColor=`${color}55`;e.currentTarget.style.boxShadow=`0 0 16px ${color}44`;}}
                    onMouseLeave={e=>{e.currentTarget.style.background=dark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)';e.currentTarget.style.borderColor=dark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)';e.currentTarget.style.boxShadow='none';}}>
                    <Icon style={{color,width:16,height:16}}/>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right */}
          <motion.div className="lg:col-span-3"
            initial={{opacity:0,x:30}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{duration:0.7,delay:0.1}}>
            <div className="p-8 rounded-3xl" style={{background:cardBg,border:cardBd,boxShadow:dark?'0 0 50px rgba(16,185,129,0.05)':'0 2px 12px rgba(0,0,0,0.07)'}}>
              <h2 className="text-xl font-black mb-6" style={{color:txt}}>Send us a message</h2>

              {status==='success'?(
                <motion.div className="text-center py-12"
                  initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} transition={{duration:0.4}}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{background:'rgba(16,185,129,0.15)',border:'1px solid rgba(16,185,129,0.35)'}}>
                    <FiCheckCircle className="w-8 h-8 text-emerald-500"/>
                  </div>
                  <h3 className="text-xl font-black mb-2" style={{color:txt}}>Message sent!</h3>
                  <p className="text-sm mb-6" style={{color:sub}}>Thanks for reaching out. We'll get back to you within 24 hours.</p>
                  <button onClick={()=>setStatus(null)} className="text-sm font-semibold text-emerald-500 hover:text-emerald-400 transition-colors">
                    Send another message →
                  </button>
                </motion.div>
              ):(
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[{id:'name',label:'Full Name',type:'text'},{id:'email',label:'Email Address',type:'email'}].map(({id,label,type})=>(
                      <div key={id}>
                        <label className="block text-sm font-semibold mb-1.5" style={{color:sub}}>{label} <span className="text-red-500">*</span></label>
                        <input type={type} value={form[id]} onChange={e=>handleSet(id)(e.target.value)} required
                          className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                          style={{background:inputBg,border:errors[id]?'1px solid rgba(239,68,68,0.5)':inputBd,color:txt}}
                          onFocus={e=>{e.target.style.borderColor='rgba(16,185,129,0.5)';e.target.style.boxShadow='0 0 0 3px rgba(16,185,129,0.1)';}}
                          onBlur={e=>{e.target.style.borderColor=errors[id]?'rgba(239,68,68,0.5)':dark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)';e.target.style.boxShadow='none';}}/>
                        {errors[id]&&<p className="text-xs mt-1 text-red-500">{errors[id]}</p>}
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{color:sub}}>Subject</label>
                    <select value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none cursor-pointer"
                      style={{background:inputBg,border:inputBd,color:txt}}>
                      {SUBJECTS.map(s=><option key={s} value={s} style={{background:dark?'#0f172a':'#ffffff',color:dark?'#f1f5f9':'#0f172a'}}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{color:sub}}>Message <span className="text-red-500">*</span></label>
                    <textarea rows={5} required value={form.message} onChange={e=>handleSet('message')(e.target.value)}
                      placeholder="Tell us how we can help…"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all"
                      style={{background:inputBg,border:errors.message?'1px solid rgba(239,68,68,0.5)':inputBd,color:txt}}
                      onFocus={e=>{e.target.style.borderColor='rgba(16,185,129,0.5)';e.target.style.boxShadow='0 0 0 3px rgba(16,185,129,0.1)';}}
                      onBlur={e=>{e.target.style.borderColor=errors.message?'rgba(239,68,68,0.5)':dark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)';e.target.style.boxShadow='none';}}/>
                    {errors.message&&<p className="text-xs mt-1 text-red-500">{errors.message}</p>}
                  </div>

                  {status==='error'&&(
                    <div className="flex items-center gap-2 p-3 rounded-xl text-sm text-red-500"
                      style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)'}}>
                      <FiAlertCircle className="w-4 h-4 flex-shrink-0"/>
                      Something went wrong. Please try again or email us directly.
                    </div>
                  )}

                  <motion.button type="submit" disabled={sending}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white text-sm"
                    style={{background:'linear-gradient(135deg,#10b981,#0d9488)',boxShadow:'0 0 24px rgba(16,185,129,0.35)',opacity:sending?0.7:1}}
                    whileHover={{scale:sending?1:1.01,boxShadow:'0 0 36px rgba(16,185,129,0.55)'}}
                    whileTap={{scale:sending?1:0.99}}>
                    {sending?<><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Sending…</>
                      :<><FiSend className="w-4 h-4"/> Send Message</>}
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
